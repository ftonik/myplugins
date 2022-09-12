(function () {
	'use strict';

	function rating_kp_imdb(card) {
		var clean_title = card.title.replace(/[ .,:;!?]+/g, ' ').trim();
		var search_date = card.release_date || card.first_air_date || card.last_air_date || '0000';
		var search_year = parseInt((search_date + '').slice(0, 4));
		var orig = card.original_title || card.original_name;
		//var kp_prox = Lampa.Storage.field('online_mod_proxy_kp') === true ? 'https://lampa-cors.herokuapp.com/' : '';
		var kp_prox = Lampa.Storage.field('online_mod_proxy_kp') === true ? 'https://cors-fallback.herokuapp.com/' : '';
		var params = {
			id: card.id,
			url: kp_prox + 'https://kinopoiskapiunofficial.tech/',
			rating_url: kp_prox + 'https://rating.kinopoisk.ru/',
			headers: {
				'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616'
			},
			cache_time: 60 * 60 * 24 * 1000 //86400000 сек = 1день Время кэша в секундах
		};
		getRating();

		function getRating() {
			var network = new Lampa.Reguest();
			var movieRating = _getCache(params.id);
			if (movieRating) {
				return _showRating(movieRating[params.id]);
			} else {
				network.clear();
				network.timeout(5000);
				network.silent(params.url + 'api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(clean_title), function (json) {
					var items = json.films || [];
					var is_sure = false;
					if (card.imdb_id) {
						var tmp = items.filter(function (elem) {
							return (elem.imdb_id || elem.imdbId) == card.imdb_id;
						});
						if (tmp.length) {
							items = tmp;
							is_sure = true;
						}
					}
					var cards = items.filter(function (c) {
						var year = c.start_date || c.year || '0000';
						c.tmp_year = parseInt((year + '').slice(0, 4));
						return !c.tmp_year || !search_year || c.tmp_year > search_year - 2 && c.tmp_year < search_year + 2;
					});
					if (orig) {
						var _tmp = cards.filter(function (elem) {
							return equalTitle(elem.orig_title || elem.nameOriginal || elem.nameEn || elem.nameRu, orig);
						});
						if (_tmp.length) {
							cards = _tmp;
							is_sure = true;
						}
					}
					if (card.title) {
						var _tmp2 = cards.filter(function (elem) {
							return equalTitle(elem.title || elem.nameRu || elem.nameEn, card.title);
						});
						if (_tmp2.length) {
							cards = _tmp2;
							is_sure = true;
						}
					}
					if (cards.length > 1 && search_year) {
						var _tmp3 = cards.filter(function (c) {
							return c.tmp_year == search_year;
						});
						if (_tmp3.length) cards = _tmp3;
					}
					if (cards.length == 1 && is_sure) {
						var id = cards[0].filmId;
						network.clear();
						network.timeout(5000);
						network.silent(params.rating_url + id + '.xml', function (str) {
							var ratingKinopoisk = 0;
							var ratingImdb = 0;
							var xml = $($.parseXML(str));
							var kp_rating = xml.find('kp_rating');
							if (kp_rating.length) {
								ratingKinopoisk = parseFloat(kp_rating.text());
							}
							var imdb_rating = xml.find('imdb_rating');
							if (imdb_rating.length) {
								ratingImdb = parseFloat(imdb_rating.text());
							}
							movieRating = _setCache(params.id, {
								kp: ratingKinopoisk,
								imdb: ratingImdb,
								timestamp: new Date().getTime()
							}); // Кешируем данные
							return _showRating(movieRating, params.id);
						}, function (a, c) {
							network.clear();
							network.timeout(5000);
							network.silent(params.url + 'api/v2.2/films/' + id, function (data) {
								movieRating = _setCache(params.id, {
									kp: data.ratingKinopoisk,
									imdb: data.ratingImdb,
									timestamp: new Date().getTime()
								}); // Кешируем данные
								return _showRating(movieRating, params.id);
							}, function (a, c) {
								Lampa.Noty.show(network.errorDecode(a, c));
							}, false, {
								headers: params.headers
							});
						}, false, {
							dataType: 'text'
						});
					} else {
						movieRating = _setCache(params.id, {
							kp: 0,
							imdb: 0,
							timestamp: new Date().getTime()
						}); // Кешируем данные
						return _showRating(movieRating);
					}
				}, function (a, c) {
					Lampa.Noty.show('Рейтинг KP   ' + network.errorDecode(a, c));
				}, false, {
					headers: params.headers
				});
			}
		}

		function equalTitle(t1, t2) {
			return typeof t1 === 'string' && typeof t2 === 'string' && t1.toLowerCase() === t2.toLowerCase();
		}

		function _getCache(movie) {
			var timestamp = new Date().getTime();
			var cache = Lampa.Storage.cache('kp_rating', 500, {}); //500 это лимит ключей
			if (cache[movie]) {
				if ((timestamp - cache[movie].timestamp) > params.cache_time) {
					// Если кеш истёк, чистим его
					delete cache[movie];
					Lampa.Storage.set('kp_rating', cache);
					return false;
				}
			} else return false;
			return cache;
		}

		function _setCache(movie, data) {
			var timestamp = new Date().getTime();
			var cache = Lampa.Storage.cache('kp_rating', 500, {}); //500 это лимит ключей
			if (!cache[movie]) {
				cache[movie] = data;
				Lampa.Storage.set('kp_rating', cache);
			} else {
				if ((timestamp - cache[movie].timestamp) > params.cache_time) {
					data.timestamp = timestamp;
					cache[movie] = data;
					Lampa.Storage.set('kp_rating', cache);
				} else data = cache[movie];
			}
			return data;
		}

		function _showRating(data, movie) {
			if (data) {
				var kp_rating = !isNaN(data.kp) && data.kp !== null ? parseFloat(data.kp).toFixed(1) : '0.0';
				var imdb_rating = !isNaN(data.imdb) && data.imdb !== null ? parseFloat(data.imdb).toFixed(1) : '0.0';
				var render = Lampa.Activity.active().activity.render();
				$('.wait_rating', render).remove();
				$('.rate--imdb', render).removeClass('hide').find('> div').eq(0).text(imdb_rating);
				$('.rate--kp', render).removeClass('hide').find('> div').eq(0).text(kp_rating);
			}
		}
	}

	function startPlugin() {
		window.rating_plugin = true;
		Lampa.Listener.follow('full', function (e) {
			if (e.type == 'complite') {
				var render = e.object.activity.render();
				if ($('.rate--kp', render).hasClass('hide') && !$('.wait_rating', render).length) {
					$('.info__rate', render).after('<div style="width:2em;margin-top:1em;margin-right:1em" class="wait_rating"><div class="broadcast__scan"><div></div></div><div>');
					rating_kp_imdb(e.data.movie);
				}
			}
		});
	}
	if (!window.rating_plugin) startPlugin();
})();
