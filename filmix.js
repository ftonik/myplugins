(function () {
    'use strict';

    function Filmix(component, _object) {
      var network = new Lampa.Reguest();
      var extract = {};
      var results = [];
      var object = _object;
      var filter_items = {};
      var choice = {
        season: 0,
        voice: 0,
        quality: 0
      };
        var url_api = 'http://filmixapp.cyou/api/v2/';
        var token = '?user_dev_apk=1.1.6&user_dev_name=Xiaomi&user_dev_os=11&user_dev_token=aaaabbbbccccddddeeeeffffaaaabbbb&user_dev_vendor=Xiaomi';
        var online_token = Lampa.Storage.get('filmix_token', '');
        if (online_token.length === 32 && token.indexOf('aaaabbbbccccddddeeeeffff') !== -1) { token = token.replace('aaaabbbbccccddddeeeeffffaaaabbbb', online_token); };
        if (!window.filmix) window.filmix = { max_qualitie: 720, is_max_qualitie: false }
      /**
       * Поиск
       * @param {Object} _object
       */


      this.search = function (_object, title, similar) {
        object = _object;
        // console.log('title', title, 'object.filmix_id', object.filmix_id, 'similar', similar);

        if (!window.filmix.is_max_qualitie && token.indexOf('aaaabbbbccccddddeeeeffff') == -1) {
            window.filmix.is_max_qualitie = true;
            network.clear(); network.timeout(15000);
            network.silent( (url_api + 'user_profile' + token), function(found) {
                if (found && found.user_data) {
                    if (found.user_data.is_pro) window.filmix.max_qualitie = 1080;
                    if (found.user_data.is_pro_plus) window.filmix.max_qualitie = 2160;
                }
                component.search(object, title);
            });
            //component.loading(false);
            return;
        }

        if (typeof(title) === 'object') title = title.pop().id;

        if (isNaN(title) === true) {

            var url = Lampa.Utils.addUrlComponent( 'http://filmixapp.cyou/api/v2/search', 'story=' + encodeURIComponent(title));
            network.clear(); network.timeout(15000);
            network.silent( url, function (found) {
                //console.log('found',found);
                if (found) {
                    var json = (typeof(found) === 'string' ? JSON.parse(found) : found);
                    if (json.length > 1) {

                        var relise = object.search_date || (object.movie.number_of_seasons ? object.movie.first_air_date : object.movie.release_date) || '0000';
                        var year = parseInt((relise + '').slice(0, 4));
                        var json_filter = json.filter(function (elem) { return (elem.title == title || elem.original_title == title) && elem.year == year } );
                        if (json_filter.length == 0) json_filter = json.filter(function (elem) { return (elem.title == title || elem.original_title == title) && elem.year >= year-1 && elem.year <= year+1  } );
                        if (json_filter.length == 0) json_filter = json.filter(function (elem) { return elem.title == title || elem.original_title == title; } );
                        if (json_filter.length == 1) {
                            object.filmix_id = json_filter.pop().id;
                            component.search(object, parseInt(object.filmix_id));
                            component.loading(false);
                            return;
                        }
                        if (json_filter.length > 0) json = json_filter;

                        var similars = [];
                        json.forEach(function (film) {
                          similars.push({
                            id: film.id,
                            title: film.title + (film.year ? ', '+film.year : '') + (film.countries ? ', '+film.countries : '') + (film.categories ? ', '+film.categories : ''),
                            year: film.year,
                            //link: film.link,
                            filmId: film.id
                          });
                        });
                        component.similars(similars);
                        component.loading(false);
                        return;
                    } else if (json.length === 1) {
                        object.filmix_id = json.pop().id;
                        component.loading(false);
                        component.search(object, parseInt(object.filmix_id));
                        return;
                    } else {
                        // Empty
                    }
                }
                component.loading(false);
                if (!Object.keys(results).length) component.empty(found.error ? found.error : 'По запросу ('+object.search+') нет результатов');
            }, function (a, c) {
              component.empty(network.errorDecode(a, c));
            });

        } else {

            object.filmix_id = title;

            var url = (window.filmix.is_max_qualitie ? url_api+'post/'+object.filmix_id+token : url_api+'post/'+object.filmix_id);
            network.clear(); network.timeout(15000);
            network.silent( url, function (found) {
                //console.log('found',found);
                if (found) {
                    var json = (typeof(found) === 'string' ? JSON.parse(found) : found);
                    results = json;
                    success(json);
                }
                component.loading(false);
                if (!Object.keys(results).length) component.empty(found.error ? found.error : 'По запросу ('+object.search+') нет результатов');
            }, function (a, c) {
              component.empty(network.errorDecode(a, c));
            });

        }
      };


      this.extendChoice = function (saved) {
        Lampa.Arrays.extend(choice, saved, true);
      };
      /**
       * Сброс фильтра
       */


      this.reset = function () {
        component.reset();
        choice = {
          season: 0,
          voice: 0,
          voice_name: '',
          quality: 0
        };
        extractData(results);
        filter();
        append(filtred());
        component.saveChoice(choice);
      };
      /**
       * Применить фильтр
       * @param {*} type
       * @param {*} a
       * @param {*} b
       */


      this.filter = function (type, a, b) {
        choice[a.stype] = b.index;
        if (a.stype == 'voice') choice.voice_name = filter_items.voice[b.index];
        component.reset();
        extractData(results);
        filter();
        append(filtred());
        component.saveChoice(choice);
      };
      /**
       * Уничтожить
       */


      this.destroy = function () {
        network.clear();
        results = null;
      };
      /**
       * Успешно, есть данные
       * @param {Object} json
       */


      function success(json) {
        results = json;
        extractData(json);
        filter();
        append(filtred());
      }
      /**
       * Получить потоки
       * @param {String} str
       * @param {Int} max_quality
       * @returns string
       */


      function extractData(json) {
        var last_episode = json.last_episode;
        var player_links = json.player_links;

        if (player_links.playlist && Object.keys(player_links.playlist).length > 0) {
            results.serial = 1;
            results.translations = [];
            results.seasons = [];
            Object.entries(player_links.playlist).forEach(function (seasons) {
                var keys = Math.abs(seasons[0]);
                if (results.seasons.indexOf(keys) == -1) results.seasons.push(keys);
                //console.log('keys', keys, 'season', seasons[1]);
                Object.entries(seasons[1]).forEach(function (translations) {
                    var keyt, translation = translations[0];
                    //console.log('keyt', keyt, 'translation', translation);

                    if (results.translations.indexOf(translation) == -1) {
                        results.translations.push(translation);
                        keyt = results.translations.indexOf(translation);
                        extract[keyt] = { json : [], "file": "", translation_id: keyt, translation: translation };
                    }
                    else keyt = results.translations.indexOf(translation);

                    var folder = [];
                    Object.entries(translations[1]).forEach(function (episodes, keye) {
                        var keye = episodes[0], episode = episodes[1];
                        //console.log('keye', keye, 'episode', episode);

                        var qualities = episode.qualities.filter( function(elem) { return parseInt(elem) <= window.filmix.max_qualitie && parseInt(elem) !== 0 }).
                            sort(function(a, b) { if (parseInt(a) > parseInt(b)) return 1; else if (parseInt(a) < parseInt(b)) return -1; else return 0; });
                        var qualitie = Math.max.apply(null, qualities);
                        var link = episode.link.replace('%s.mp4',qualitie+'.mp4');

                        folder[keye] = {
                            "id": keys + '_' + keye,
                            "comment": keye + ' ' + Lampa.Lang.translate('torrent_serial_episode') + ' <i>' + qualitie + '</i>',
                            "file": link,
                            "episode": keye,
                            "season": keys,
                            "quality": qualitie,
                            "qualities": qualities,
                            "translation": keyt, //translation,
                        };
                    })
                    extract[keyt].json[keys] = { "id": keys, "comment": keys + " сезон", "folder": folder, "translation": keyt };
                })
            })
        } else if (player_links.movie && player_links.movie.length > 0) {
            results.serial = 0;
            Object.entries(player_links.movie).forEach(function (translations) {
                var translation = translations[0], movie = translations[1];
                //console.log('translation', translation, 'movie', movie);

                var qualities = movie.link.match(/.+\[(.+[\d]),?\].+/i);
                if (qualities) qualities = qualities[1].split(",").filter( function (elem) { return parseInt(elem) <= window.filmix.max_qualitie && parseInt(elem) !== 0 }).
                    sort(function(a, b) { if (parseInt(a) > parseInt(b)) return 1; else if (parseInt(a) < parseInt(b)) return -1; else return 0; });
                var qualitie = Math.max.apply(null, qualities);
                var link = movie.link.replace(/\[(.+[\d]),?\]/i, qualitie);

                extract[translation] = { json : {}, "file": link, translation : movie.translation, "quality": qualitie, "qualities": qualities };
            })
        }
      }
      /**
       * Найти поток
       * @param {Object} element
       * @param {Int} max_quality
       * @returns string
       */


      function getFile(element, max_quality) {
        var file = '';
        var quality = false;
        var qualities =null;
        var select_quality = 2160;

        //console.log('element', element);
        if (element.season) {
            file = extract[element.translation].json[element.season].folder[element.episode].file;
            qualities = extract[element.translation].json[element.season].folder[element.episode].qualities;
            max_quality = extract[element.translation].json[element.season].folder[element.episode].quality;
        }
        else {
            file = extract[element.translation].file;
            qualities = extract[element.translation].qualities;
            max_quality = extract[element.translation].quality;
            var filter_data = Lampa.Storage.get('online_filter', '{}');
            select_quality = parseInt(filter_items.quality[filter_data.quality]);
        }
        //console.log('file', file, 'qualities', qualities);
        var preferably = parseInt(Lampa.Storage.get('video_quality_default', '1080'));
        if (select_quality > preferably) select_quality = preferably;


        var file_filtred = file;
        if (file) {
          quality = {};
          for (var n in qualities) {
            if (parseInt(qualities[n]) <= parseInt(select_quality)) {
                quality[qualities[n]+'p'] = file.replace( new RegExp(max_quality+'.mp4', 'ig'), qualities[n]+'.mp4');
                file_filtred = quality[qualities[n]+'p'] ;
            }
          };
        }
        return {
          file: file_filtred,
          quality: quality
        };
      }
      /**
       * Построить фильтр
       */


      function filter() {
        filter_items = {
          season: [],
          voice: [],
          voice_info: [],
          quality : []
        };

        if (results.serial == 0) {

            var qualities = ['480','720','1080','1440','2160'];
            for( var key in extract) {
                if (extract[key].quality && parseInt(results.quality) < parseInt(extract[key].quality)) results.quality = extract[key].quality;
            }
            if (results.quality) {
                for( var key in qualities)
                    if (parseInt(results.quality) >= parseInt(qualities[key])) filter_items.quality.unshift(qualities[key]);
            }
            if (filter_items.quality.length == 0) filter_items.quality.push('720');

        } else {

            if (results.seasons)
              results.seasons.forEach(function (season) {
                  filter_items.season.sort(function(a, b){ return a - b; }).push(Lampa.Lang.translate('torrent_serial_season') + ' ' + (season));
              })

            if (results.translations)
              results.translations.forEach(function (translation, keyt) {
                  var season = filter_items.season[choice.season].split(' ').pop();
                  if (extract[keyt].json[season]) {
                      if (filter_items.voice.indexOf(translation) == -1) {
                          filter_items.voice[keyt] = translation;
                          filter_items.voice_info[keyt] = { id: keyt };
                      }
                  }
              })

            if (filter_items.voice_info.length > 0 && !filter_items.voice_info[choice.voice]) {
                choice.voice = undefined;
                filter_items.voice_info.forEach( function (voice_info) {
                    if (choice.voice == undefined) choice.voice = voice_info.id;
                })
            }
        }
        component.filter(filter_items, choice);
        // console.log('filter_items', filter_items);
      }
      /**
       * Отфильтровать файлы
       * @returns array
       */


      function filtred() {
        var filtred = [];
        var filter_data = Lampa.Storage.get('online_filter', '{}');

        if (results.serial == 1) {
          for( var keym in extract) {
            var movie = extract[keym];
            for( var keye in movie.json) {
              var episode = movie.json[keye];
              if (episode.id == filter_data.season + 1) {
                episode.folder.forEach( function (media) {
                  if (media.translation == filter_items.voice_info[filter_data.voice].id) {
                    filtred.push({
                      episode: parseInt(media.episode),
                      season: media.season,
                      title: media.episode + (media.title ? ' - ' + media.title : ''),
                      quality: media.quality + 'p',
                      translation: media.translation
                    });
                  }
                });
              }
            };
          };
        } else if (results.player_links.movie && results.player_links.movie.length > 0) {
          for( var keym in extract) {
            var movie = extract[keym];

            var select_quality = parseInt(filter_items.quality[filter_data.quality]);
            var qualities = movie.qualities.filter( function (elem) { return parseInt(elem) <= select_quality });
            var qualitie = Math.max.apply(null, qualities);
            if (qualitie) {
                filtred.push({
                    title: movie.translation,
                    quality: movie.quality + 'p => ' + qualitie + 'p',
                    translation: keym,
                });
            }
          };
        }
        return filtred;
      }
      /**
       * Добавить видео
       * @param {Array} items
       */


      function append(items) {
        component.reset();
        if (items.length == 0) { component.empty('В карточке пусто'); return; }
        var viewed = Lampa.Storage.cache('online_view', 5000, []);
        var last_episode = component.getLastEpisode(items);
        items.forEach(function (element) {
          if (element.season) element.title = 'S' + element.season + ' / ' + Lampa.Lang.translate('torrent_serial_episode') + ' ' + element.episode;
          element.info = element.season ? ' / ' + Lampa.Utils.shortText(filter_items.voice[choice.voice], 50) : '';

          if (element.season) {
            element.translate_episode_end = last_episode;
            element.translate_voice = filter_items.voice[choice.voice];
          }

          var hash = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title].join('') : object.movie.original_title);
          var view = Lampa.Timeline.view(hash);
          var item = Lampa.Template.get('online', element);
          var hash_file = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title, filter_items.voice[choice.voice]].join('') : object.movie.original_title + element.title);
          item.addClass('video--stream');
          element.timeline = view;
          item.append(Lampa.Timeline.render(view));

          if (Lampa.Timeline.details) {
            item.find('.online__quality').append(Lampa.Timeline.details(view, ' / '));
          }

          if (viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
          item.on('hover:enter', function () {
            if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);
            var extra = getFile(element, element.quality);

            if (extra.file) {
              var playlist = [];
              var first = {
                url: extra.file,
                quality: extra.quality,
                timeline: view,
                title: element.season ? element.title : object.movie.title + ' / ' + element.title
              };

              if (element.season) {
                items.forEach(function (elem) {
                  var ex = getFile(elem, elem.quality);
                  playlist.push({
                    title: elem.title,
                    url: ex.file,
                    quality: ex.quality,
                    timeline: elem.timeline
                  });
                });
              } else {
                playlist.push(first);
              }

              if (playlist.length > 1) first.playlist = playlist;
              Lampa.Player.play(first);
              Lampa.Player.playlist(playlist);

              if (viewed.indexOf(hash_file) == -1) {
                viewed.push(hash_file);
                item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
                Lampa.Storage.set('online_view', viewed);
              }
            } else Lampa.Noty.show(Lampa.Lang.translate('online_nolink'));
          });
          component.append(item);
          component.contextmenu({
            item: item,
            view: view,
            viewed: viewed,
            hash_file: hash_file,
            element: element,
            file: function file(call) {
              call(getFile(element, element.quality));
            }
          });
        });
        component.start(true);
      }

    };

    function HDRezka(component, _object) {
      var network = new Lampa.Reguest();
      var extract = [];
      var results = [];
      var object = _object;
      var filter_items = {};
      var choice = {
        season: 0,
        voice: 0,
        quality: 0
      };
        var translations = [];
        // var backend = 'http://192.168.1.100:3333/hdrezkaurl?v=801';
        var backend = 'http://freebie.tom.ru/hdrezkaurl?v=801';
      /**
       * Поиск
       * @param {Object} _object
       */


      this.search = function (_object, title, similar) {
        object = _object;
        // console.log('title', title, 'similar', similar);

        var url = backend;
        if (isNaN(title) == true) {
            if (title.length < 3) { component.empty('title (' + title + ') is smoll'); return; }
            url += '&id=' + object.movie.id + '&title=' + title;
            var relise = object.search_date || (object.movie.number_of_seasons ? object.movie.first_air_date : object.movie.release_date) || '0000';
            var year = parseInt((relise + '').slice(0, 4));
            url += '&year=' + year;
        } else {
            var title = similar.slice().pop();
            url += '&id=' + object.movie.id + '&link=' + title.link;
        }

        network.clear(); network.timeout(20000);
        network.silent( url, function (found) {
            // console.log('found',found);
            if (found && found.result) {
                if (found.action === 'select') {
                    var json = (typeof(found.data) === "string" ? JSON.parse(found.data) : found.data);
                    var similars = [];
                    json.forEach(function (film) {
                      similars.push({
                        id: film.id,
                        title: film.title + (film.year ? ', '+film.year : '') + (film.country ? ', '+film.country : '') + (film.category ? ', '+film.category : ''),
                        year: film.year,
                        link: film.link,
                        filmId: film.id
                      });
                    });
                    component.similars(similars);
                    component.loading(false);
                    return;
                } else if (found.action === 'done') {
                    results = (typeof(found.data) === "string" ? JSON.parse(found.data) : found.data);
                    //console.log('results', results);
                    success(results);
                }
            }
            component.loading(false);
            if (!Object.keys(results).length) component.empty(found.error ? found.error : 'По запросу ('+object.search+') нет результатов');
        }, function (a, c) {
          component.empty(network.errorDecode(a, c));
        });
      };


      this.extendChoice = function (saved) {
        Lampa.Arrays.extend(choice, saved, true);
      };
      /**
       * Сброс фильтра
       */


      this.reset = function () {
        component.reset();
        choice = {
          season: 0,
          voice: 0,
          quality: 0
        };
        filter();
        append(filtred());
        component.saveChoice(choice);
      };
      /**
       * Применить фильтр
       * @param {*} type
       * @param {*} a
       * @param {*} b
       */


      this.filter = function (type, a, b) {
        choice[a.stype] = b.index;
        if (a.stype == 'voice') choice.voice_name = filter_items.voice[b.index];
        component.reset();
        if (filter()) return;
        append(filtred());
        component.saveChoice(choice);
      };
      /**
       * Уничтожить
       */


      this.destroy = function () {
        network.clear();
        results = null;
      };
      /**
       * Успешно, есть данные
       * @param {Object} json
       */


      function success(json) {
        // уже присвоен results = json;
        extractData(json);
        filter();
        append(filtred());
        component.loading(false);
        component.saveChoice(choice);
      }
      /**
       * Получить потоки
       * @param {String} str
       * @param {Int} max_quality
       * @returns string
       */


      function extractData(json) {
        extract = [];
        results.forEach( function (translation, keyt) {
          if (translation == null) return;
          //console.log('translation', translation);
          if (translations.indexOf(translation) == -1) { translations[keyt] = translation; }
          if (translation.serial == 1) {
              extract[keyt] = { json : [], "file": translation.link, 'serial': translation.serial, translation : translation.translation }
              translation.playlists.forEach(function (seasons, keys) {
                  if (seasons == null) return;
                  //console.log('keys', keys, 'seasons', seasons);

                  extract[keyt].last_season = keys;
                  var folder = [];
                  seasons.forEach(function (episode, keye) {
                      if (episode == null) return;
                      //console.log('keye', keye, 'episode', episode);

                        var qualities = Object.keys(episode);
                        var qualitie = qualities.slice(-1).pop();
                        var link = episode[qualitie];

                        folder[keye] = {
                            "id": keys + '_' + keye,
                            "comment": keye + ' ' + Lampa.Lang.translate('torrent_serial_episode') + ' <i>' + qualitie + '</i>',
                            "file": link,
                            "episode": keye,
                            "season": keys,
                            "quality": qualitie,
                            "qualities": qualities,
                            "translation": keyt,
                            'subtitles': translation.subtitles[keys + '_' + keye],
                        };

                  })
                  extract[keyt].json[keys] = { "id": keys, "comment": keys + " сезон", "folder": folder, "translation": keyt };
              })
          } else if (translation.serial == 0) {
              var qualities = (translation.playlists == undefined ? [] : Object.keys(translation.playlists));
              if (qualities.length > 1) {
                  var qualitie = qualities.slice(-1).pop();
                  var link = translation.playlists[qualitie];
                  extract[keyt] = { json : {}, "file": link, translation : translation.translation, "quality": qualitie, "qualities": qualities, 'serial': translation.serial, subtitles: translation.subtitles };
              } else {
                  var qualitie = translation.quality;
                  var link = '123';
                  extract[keyt] = { json : {}, "file": link, translation : translation.translation, "quality": qualitie, "qualities": qualities, 'serial': translation.serial, subtitles: translation.subtitles };
              }
          }
        })
        //console.log('extract', extract);
      }

      function getEpisodes() {
        //console.log('subtitle', subtitle);
          network.clear();
          network.timeout(20000);
          var url = backend;
          url += '&id=' + object.movie.id + '&link=' + results[choice.voice].link + '&translation=' + choice.voice + '&favs=' + results[choice.voice].favs;
          network.silent(url, function (found) {
              //console.log('found', found);
              if (found.action === 'done') {
                  results = (typeof(found.data) === "string" ? JSON.parse(found.data) : found.data);
                  //console.log('results', results);
              }
              success(results);
          }, function (a, c) {
            component.loading(false);
            component.empty(network.errorDecode(a, c));
          });

      }

      function parseSubtitles(subtitle) {
        //console.log('subtitle', subtitle);
        if (subtitle === 'false' || subtitle === undefined || Object.keys(subtitle).length === 0) return null;
        if (subtitle) {
          var index = -1;
          return subtitle.split(',').map(function (sb) {
            var sp = sb.split(']');
            index++;
            return {
              label: sp[0].slice(1),
              url: sp.pop(),
              index: index
            };
          });
        }
      }
      /**
       * Найти поток
       * @param {Object} element
       * @param {Int} max_quality
       * @returns string
       */


      function getFile(element, max_quality) {
        var file = '';
        var quality = false;
        var qualities =null;

        //console.log('element', element, 'max_quality', max_quality);
        if (element.season) {
            file = extract[element.translation].json[element.season].folder[element.episode].file;
            qualities = extract[element.translation].json[element.season].folder[element.episode].qualities;
        }
        else {
            //file = extract[element.translation].file;
            qualities = extract[element.translation].qualities;
            quality = results[element.translation].playlists;
            file = quality[max_quality];
        }
        //console.log('file', file, 'qualities', qualities);

        return {
          file: file,
          quality: quality
        };
      }
      /**
       * Построить фильтр
       */


      function filter() {
        filter_items = {
          season: [],
          voice: [],
          voice_info: [],
          quality : []
        };
        extract.forEach( function (translation, keyt) {
            if (translation.serial == 0) {

            } else if (translation.serial == 1) {

                var s = translation.last_season;
                while (s--) {
                    if (filter_items.season.indexOf(Lampa.Lang.translate('torrent_serial_season') + ' ' + (translation.last_season - s)) == -1)
                        filter_items.season.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + (translation.last_season - s));
                }

                if (translation.json[choice.season + 1] || translation.json.length === 0) {
                    if (filter_items.voice.indexOf(translation.translation) == -1) {
                        filter_items.voice[keyt] = translation.translation;
                        filter_items.voice_info[keyt] = { id: keyt };
                    }
                }


            }

        })
        //console.log('choice.voice', choice.voice, 'filter_items',filter_items);
        if (filter_items.voice_info.length > 0 && !filter_items.voice_info[choice.voice]) {
            choice.voice = undefined;
            filter_items.voice_info.forEach( function (voice_info) {
                if (choice.voice == undefined) choice.voice = voice_info.id;
            })
        }
        // console.log('filter', choice);
        if (extract[choice.voice] !== undefined && extract[choice.voice].serial == 1 && extract[choice.voice].json !== undefined && Object.keys(extract[choice.voice].json).length === 0) {
            getEpisodes();
            return true;
        }
        component.filter(filter_items, choice);
      }
      /**
       * Отфильтровать файлы
       * @returns array
       */


      function filtred() {
        var filtred = [];
        var filter_data = Lampa.Storage.get('online_filter', '{}');

        extract.forEach(function (translation, keyt) {
            if (translation == null) return;
            if (translation.serial == 1) {
                translation.json.forEach(function (seasons, keys) {
                    if ( keys == filter_data.season + 1 ) {
                        seasons.folder.forEach(function (episode, keye) {
                            if (episode.translation == filter_items.voice_info[filter_data.voice].id) {
                              filtred.push({
                                episode: parseInt(episode.episode),
                                season: episode.season,
                                title: episode.episode + (episode.title ? ' - ' + episode.title : ''),
                                //quality: episode.quality + 'p',
                                quality: (episode.qualities.length > 1 ? episode.quality+'p' : results[keyt].quality ),
                                translation: episode.translation,
                                subtitles: parseSubtitles(episode.subtitles),
                              });
                            }
                        })
                    }
                })
            } else {
                filtred.push({
                    title: translation.translation,
                    quality: (translation.qualities.length > 1 ? translation.quality : results[keyt].quality ),
                    translation: keyt,
                    subtitles: parseSubtitles(translation.subtitles),
                });
            }
        })
        //console.log('filtred', filtred);
        return filtred;
      }
      /**
       * Добавить видео
       * @param {Array} items
       */


      function append(items) {
        component.reset();
        var viewed = Lampa.Storage.cache('online_view', 5000, []);
        var last_episode = component.getLastEpisode(items);
        items.forEach(function (element) {
          if (element.season) element.title = 'S' + element.season + ' / ' + Lampa.Lang.translate('torrent_serial_episode') + ' ' + element.title;
          element.info = element.season ? ' / ' + filter_items.voice[choice.voice] : '';
          var hash = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title].join('') : object.movie.original_title);
          var view = Lampa.Timeline.view(hash);
          var item = Lampa.Template.get('online', element);
          var hash_file = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title, filter_items.voice[choice.voice]].join('') : object.movie.original_title + element.title);
          item.addClass('video--stream');
          element.timeline = view;

          if (element.season) {
            element.translate_episode_end = last_episode;
            element.translate_voice = filter_items.voice[choice.voice];
          }

          item.append(Lampa.Timeline.render(view));

          if (Lampa.Timeline.details) {
            item.find('.online__quality').append(Lampa.Timeline.details(view, ' / '));
          }

          if (viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
          item.on('hover:enter', function () {
            if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);

            if (element.loading) return;
            element.loading = true;
            getStream(element, function (extra) {
              extra = getFile(extra, extra.quality);
              var first = {
                url: extra.file,
                timeline: view,
                quality: extra.quality,
                title: element.title
              };
              Lampa.Player.play(first);

              if (element.season && Lampa.Platform.version) {
                var playlist = [];
                items.forEach(function (elem) {
                  var cell = {
                    url: function url(call) {
                      getStream(elem, function (extra) {
                        extra = getFile(extra, extra.quality);
                        cell.url = extra.file;
                        cell.quality = extra.quality;
                        call();
                      }, function () {
                        cell.url = '';
                        call();
                      });
                    },
                    timeline: elem.timeline,
                    title: elem.title
                  };
                  if (elem == element) cell.url = extra.file;
                  playlist.push(cell);
                });
                Lampa.Player.playlist(playlist);
              } else {
                Lampa.Player.playlist([first]);
              }

              element.loading = false;
              if (element.subtitles && Lampa.Player.subtitles) Lampa.Player.subtitles(element.subtitles);

              if (viewed.indexOf(hash_file) == -1) {
                viewed.push(hash_file);
                item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
                Lampa.Storage.set('online_view', viewed);
              }
            }, function (error) {
              element.loading = false;
              Lampa.Noty.show(error || Lampa.Lang.translate('online_nolink'));
            });

          });
          component.append(item);
          component.contextmenu({
            item: item,
            view: view,
            viewed: viewed,
            hash_file: hash_file,
            file: function file(call) {
              getStream(element, function (stream) {
                extra = getFile(extra, extra.quality);
                call({
                  file: extra.file,
                  quality: extra.quality
                });
              });
            }
          });
        });
        component.start(true);
      }

      function getStream(element, call, error) {
        if (element.season)
            element.link = extract[element.translation].json[element.season].folder[element.episode].file;
        else element.link = extract[element.translation].file;

        //console.log('element', element);
        if (element.link.startsWith('http') && (element.link.substr(-5) === ".m3u8" || element.link.substr(-4) === ".mp4")) {
            if ( results[element.translation].serial == 0 &&  Object.keys(results[element.translation].playlists).length > 1)
                return call(element);
            if ( results[element.translation].serial == 1 &&  Object.keys(results[element.translation].playlists[ element.season ][ element.episode ]).length > 1)
                return call(element);
        } else {
          var url = backend;
          url += '&id=' + object.movie.id + '&link=' + results[element.translation].link + '&translation=' + element.translation + '&favs=' + results[element.translation].favs;
          if (element.season) url += '&season=' + element.season + '&episode=' + element.episode;
          network.clear();
          network.timeout(20000);
          network.silent( url, function (str) {
              //console.log('str', str);
              if (str.indexOf('error') > 0) { return error(str); }
              var json = JSON.parse(str);
              if (json.playlists && Object.keys(json.playlists).length === 0) return error('Ссылки на видео не получены');

              var result = results[element.translation];
              if (result.serial == 1) {
                  result.playlists[ element.season ][ element.episode ] = json.playlists;
                  result.subtitles[ element.season+'_'+element.episode ] = json.subtitles;
                  success(results);
                  element.link = extract[element.translation].json[ element.season ].folder[ element.episode ].file;
                  element.quality = extract[element.translation].json[ element.season ].folder[ element.episode ].quality;
                  element.subtitles = parseSubtitles(json.subtitles);
                  return call(element);
              } else {
                  result.playlists = json.playlists;
                  result.subtitles = json.subtitles;
                  success(results);
                  element.link = extract[element.translation].file;
                  element.quality = extract[element.translation].quality;
                  element.subtitles = parseSubtitles(json.subtitles);
                  return call(element);
              }

          }, function (a, c) {
              return error(network.errorDecode(a, c));
          },
              false, { dataType: 'text' }
          );
        }
      };

    };

    function HDVB(component, _object) {
      var network = new Lampa.Reguest();
      var extract = {};
      var results = [];
      var object = _object;
      var filter_items = {};
      var choice = {
        season: 0,
        voice: 0,
        quality: 0
      };
        var translator = {};
        var url = 'https://apivb.info/api/videos.json?token=5e2fe4c70bafd9a7414c4f170ee1b192&id_kp=';
        // var backend = 'http://192.168.1.100:3333/hdvburl?v=801&id_kp=';
        var backend = 'http://freebie.tom.ru/hdvburl?v=801&id_kp=';
      /**
       * Поиск
       * @param {Object} _object
       */


      this.search = function (_object, kinopoisk_id) {
        object = _object;
        object.kinopoisk_id = kinopoisk_id;
        //console.log('kinopoisk_id', kinopoisk_id);

        if (isNaN(kinopoisk_id)) { component.empty("kinopoisk_id is null"); return; }
        if (backend.substr(-6) === "id_kp=") backend += kinopoisk_id;

        network.clear(); network.timeout(20000);
        network.silent(url + kinopoisk_id, function (found) {
        //console.log('found',found);
            if (found) {
                (typeof(found) === "string" ? JSON.parse(found) : found).forEach( function (result, keyt) {

                    result.link = result.iframe_url;

                    result.serial = (result.type == 'serial' ? 1 : 0);
                    result.translation_id = keyt; //result.translator_id;
                    result.translation = result.translator;
                    result.max_qual = '2160';

                    if (result.serial == 1) {
                        result.playlists = [];
                        result.serial_episodes.forEach( function (season, keys) {
                            result.last_season = season.season_number;
                            result.playlists[season.season_number] = [];
                            season.episodes.forEach( function (episode, keye) {
                                result.playlists[season.season_number][episode] = { };
                                result.playlists[season.season_number][episode][ result.max_qual ] = result.link;
                            })
                        })
                        var season = 0;
                        while (++season <= result.season) {
                            result.playlists[season] = [];
                        }
                    } else {
                        result.playlists = {  };
                        result.playlists[ result.max_qual ] = result.link;
                    }
                    translator[result.translation] = result.translation_id;
                    results[result.translation_id] = Object.assign({}, result);

                })

                //console.log('results', results);
                success(results);
            }
            component.loading(false);
            if (!Object.keys(results).length) component.empty(found.error ? found.error : 'По запросу (' + 'kinopoisk_id='+kinopoisk_id + ') нет результатов');
        }, function (a, c) {
          component.empty(network.errorDecode(a, c));
        });
      };


      this.extendChoice = function (saved) {
        Lampa.Arrays.extend(choice, saved, true);
      };
      /**
       * Сброс фильтра
       */


      this.reset = function () {
        component.reset();
        choice = {
          season: 0,
          voice: 0,
          voice_name: ''
        };
        extractData(results);
        filter();
        append(filtred());
        component.saveChoice(choice);
      };
      /**
       * Применить фильтр
       * @param {*} type
       * @param {*} a
       * @param {*} b
       */


      this.filter = function (type, a, b) {
        choice[a.stype] = b.index;
        if (a.stype == 'voice') choice.voice_name = filter_items.voice[b.index];
        component.reset();
        extractData(results);
        filter();
        append(filtred());
        component.saveChoice(choice);
      };
      /**
       * Уничтожить
       */


      this.destroy = function () {
        network.clear();
        results = null;
      };
      /**
       * Успешно, есть данные
       * @param {Object} json
       */


      function success(json) {
        // уже присвоен results = json;
        extractData(json);
        filter();
        append(filtred());
      }
      /**
       * Получить потоки
       * @param {String} str
       * @param {Int} max_quality
       * @returns string
       */


      function extractData(json) {
        results.forEach( function (translations, keyt) {
        //console.log('translations', translations);
        if (translations.serial == 1) {
            extract[keyt] = { json : [], "file": translations.link, 'serial': translations.serial }

            for( var keys in translations.playlists) {
                var seasons = translations.playlists[keys];
                //console.log('keys', keys, 'seasons', seasons);
                var folder = [];
                for( var keye in seasons) {
                    var episode = seasons[keye];
                    //console.log('keye', keye, 'episode', episode);

                    var qualities = Object.keys(episode);
                    //if (qualities) qualities = qualities.filter( function (elem) { return parseInt(elem) <= parseInt(????) && parseInt(elem) !== 0 });
                    var qualitie = Math.max.apply(null, qualities);
                    var link = episode[qualitie];

                    folder[keye] = {
                        "id": keys + '_' + keye,
                        "comment": keye + ' серия<br><i>' + qualitie + '</i>',
                        "file": link,
                        "episode": keye,
                        "season": keys,
                        "quality": qualitie,
                        "qualities": qualities,
                        "translation": keyt,
                    };
                }
                extract[keyt].json[keys] = { "id": keys, "comment": keys + " сезон", "folder": folder, "translation": keyt };

            }
        } else if (translations.serial == 0) {
            var translation = keyt;
            for( var keym in translations.playlists) {
                var movie =  translations.playlists[keym];

                var qualities = Object.keys(translations.playlists);
                if (qualities) qualities = qualities.filter( function (elem) { return parseInt(elem) <= parseInt(keym) && parseInt(elem) !== 0 });
                var qualitie = Math.max.apply(null, qualities);
                var link = movie;

                extract[translation] = { json : {}, "file": link, translation : translations.translation, "quality": qualitie, "qualities": qualities, 'serial': translations.serial };
            }
        }
        })
        //console.log('extract', extract);
      }
      /**
       * Найти поток
       * @param {Object} element
       * @param {Int} max_quality
       * @returns string
       */


      function getFile(element, max_quality) {
        var file = '';
        var file_quality = '';
        var quality = false;
        var qualities =null;
        var select_quality = 2160;

        //console.log('element', element);
        if (element.season) {
            file = extract[element.translation].json[element.season].folder[element.episode].file;
            file_quality = extract[element.translation].json[element.season].folder[element.episode].quality;
            qualities = extract[element.translation].json[element.season].folder[element.episode].qualities;

        }
        else {
            file = extract[element.translation].file;
            file_quality = extract[element.translation].quality;
            qualities = extract[element.translation].qualities;
            //var filter_data = Lampa.Storage.get('online_filter', '{}');
            //select_quality = parseInt(filter_items.quality[filter_data.quality]);
        }
        //console.log('file', file, 'qualities', qualities);

        var file_filtred = file;
        if (file) {
          quality = {};
          for (var n in qualities) {
            if (parseInt(qualities[n]) <= parseInt(select_quality) && qualities.length > 1) {
                quality[qualities[n]+'p'] = file.replace('/'+file_quality, '/'+qualities[n]);
            } else {
                quality[qualities[n]+'p'] = file;
            }
            file_filtred = quality[qualities[n]+'p'] ;
          };
        }
        return {
          file: file_filtred,
          quality: quality
        };
      }
      /**
       * Построить фильтр
       */


      function filter() {
        filter_items = {
          season: [],
          voice: [],
          voice_info: [],
          quality : []
        };

        results.forEach( function (translation, keyt) {
            if (translation.serial == 0) {
                // var qualities = ['480','720','1080','2160'];
                // if (translation.max_qual) {
                //     for( var key in qualities)
                //         if (parseInt(translation.max_qual)  >= parseInt(qualities[key]))
                //             if (filter_items.quality.indexOf(qualities[key]) == -1) filter_items.quality.unshift(qualities[key]);
                // }
                // if (filter_items.quality.length == 0) filter_items.quality.push('720');
            } else if (translation.serial == 1) {

                var s = translation.last_season;
                while (s--) {
                    if (filter_items.season.indexOf(Lampa.Lang.translate('torrent_serial_season') + ' ' + (translation.last_season - s)) == -1)
                        filter_items.season.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + (translation.last_season - s));
                }

                if (translation.playlists[choice.season + 1]) {
                    if (filter_items.voice.indexOf(translation.translation) == -1) {
                        filter_items.voice[keyt] = translation.translation;
                        filter_items.voice_info[keyt] = { id: keyt };
                    }
                }

            }

        })
        //console.log('choice.voice', choice.voice, 'filter_items',filter_items);
        if (filter_items.voice_info.length > 0 && !filter_items.voice_info[choice.voice]) {
            choice.voice = undefined;
            filter_items.voice_info.forEach( function (voice_info) {
                if (choice.voice == undefined) choice.voice = voice_info.id;
            })
        }
        component.filter(filter_items, choice);
      }
      /**
       * Отфильтровать файлы
       * @returns array
       */


      function filtred() {
        var filtred = [];
        var filter_data = Lampa.Storage.get('online_filter', '{}');

        for( var keym in extract) {
          var movie = extract[keym];
          if (movie.serial == 1) {
            for( var keye in movie.json) {
              var episode = movie.json[keye];
              if (episode.id == filter_data.season + 1) {
                episode.folder.forEach( function (media) {
                  if (media.translation == filter_items.voice_info[filter_data.voice].id) {
                    filtred.push({
                      episode: parseInt(media.episode),
                      season: media.season,
                      title: media.episode + (media.title ? ' - ' + media.title : ''),
                      //quality: media.quality + 'p',
                      quality: (media.qualities.length > 1 ? media.quality+'p' : results[keym].quality ),
                      translation: media.translation
                    });
                  }
                });
              }
            };
          } else {
            var select_quality = parseInt(filter_items.quality[filter_data.quality]);
            var qualities = movie.qualities.filter( function (elem) { return parseInt(elem) <= select_quality });
            var qualitie = Math.max.apply(null, qualities);
            if (qualitie) {
                filtred.push({
                    title: movie.translation,
                    //quality: movie.quality + 'p / ' + qualitie + 'p',
                    quality: (movie.qualities.length > 1 ? movie.quality+'p' : results[keym].quality ), // + ' / ' + qualitie + 'p',
                    translation: keym,
                });
            }
          };
        }
        //console.log('filtred', filtred);
        return filtred;
      }
      /**
       * Добавить видео
       * @param {Array} items
       */


      function append(items) {
        component.reset();
        var viewed = Lampa.Storage.cache('online_view', 5000, []);
        var last_episode = component.getLastEpisode(items);
        items.forEach(function (element) {
          if (element.season) element.title = 'S' + element.season + ' / ' + Lampa.Lang.translate('torrent_serial_episode') + ' ' + element.episode;
          element.info = element.season ? ' / ' + Lampa.Utils.shortText(filter_items.voice[choice.voice], 50) : '';

          if (element.season) {
            element.translate_episode_end = last_episode;
            element.translate_voice = filter_items.voice[choice.voice];
          }

          var hash = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title].join('') : object.movie.original_title);
          var view = Lampa.Timeline.view(hash);
          var item = Lampa.Template.get('online', element);
          var hash_file = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title, filter_items.voice[choice.voice]].join('') : object.movie.original_title + element.title);
          item.addClass('video--stream');
          element.timeline = view;
          item.append(Lampa.Timeline.render(view));

          if (Lampa.Timeline.details) {
            item.find('.online__quality').append(Lampa.Timeline.details(view, ' / '));
          }

          if (viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
          item.on('hover:enter', function () {
            if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);

            if (element.loading) return;
            element.loading = true;
            getStream(element, function (extra) {
              extra = getFile(extra, extra.quality);
              var first = {
                url: extra.file,
                timeline: view,
                quality: extra.quality,
                title: element.title
              };
              Lampa.Player.play(first);

              if (element.season && Lampa.Platform.version) {
                var playlist = [];
                items.forEach(function (elem) {
                  var cell = {
                    url: function url(call) {
                      getStream(elem, function (extra) {
                        extra = getFile(extra, extra.quality);
                        cell.url = extra.file;
                        cell.quality = extra.quality;
                        call();
                      }, function () {
                        cell.url = '';
                        call();
                      });
                    },
                    timeline: elem.timeline,
                    title: elem.title
                  };
                  if (elem == element) cell.url = extra.file;
                  playlist.push(cell);
                });
                Lampa.Player.playlist(playlist);
              } else {
                Lampa.Player.playlist([first]);
              }

              element.loading = false;
              if (element.subtitles && Lampa.Player.subtitles) Lampa.Player.subtitles(element.subtitles);

              if (viewed.indexOf(hash_file) == -1) {
                viewed.push(hash_file);
                item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
                Lampa.Storage.set('online_view', viewed);
              }
            }, function (error) {
              element.loading = false;
              Lampa.Noty.show(error || 'Не удалось извлечь ссылку');
            });

          });
          component.append(item);
          component.contextmenu({
            item: item,
            view: view,
            viewed: viewed,
            hash_file: hash_file,
            file: function file(call) {
              getStream(element, function (extra) {
                extra = getFile(extra, extra.quality);
                call({
                  file: extra.file,
                  quality: extra.quality
                });
              });
            }
          });
        });
        component.start(true);
      }

      function getStreamQuality(element, call) {
          network.clear();
          network.timeout(10000);
          network.silent( element.link, function (plist) {
              //console.log('plist', typeof(plist), plist);
              if (results[element.translation].serial == 1) results[element.translation].playlists[ element.season ][ element.episode ] = {}; else results[element.translation].playlists = {};

              ['2160', '1080', '720', '480', '360'].forEach(function (elem) {
                  var match = plist.toString().match(new RegExp('\\.?(.*\/'+elem+'.+m3u8)', 'm'));
                  if (match)
                      if (results[element.translation].serial == 1)
                          results[element.translation].playlists[ element.season ][ element.episode ][ elem ] = element.link.replace('/index.m3u8', (match[1].startsWith('/') ? match[1] : '/'+match[1]));
                      else
                          results[element.translation].playlists[ elem ] = element.link.replace('/index.m3u8', (match[1].startsWith('/') ? match[1] : '/'+match[1]));
              })
              //console.log('results', results);
              extractData(results);
              append(filtred());
              return call(element);

          }, function (a, c) {
              return call(element);
          }, false, {
            dataType: 'text'
          });
      }

      function getStream(element, call, error) {
        if (element.season)
            element.link = extract[element.translation].json[element.season].folder[element.episode].file
        else element.link = extract[element.translation].file

        //console.log('element', element);
        if (element.link.substr(-5) === ".m3u8") {
            if ( results[element.translation].serial == 0 &&  Object.keys(results[element.translation].playlists).length > 1)
                return call(element);
            if ( results[element.translation].serial == 1 &&  Object.keys(results[element.translation].playlists[ element.season ][ element.episode ]).length > 1)
                return call(element);

            getStreamQuality(element, function (extra) {
                return call(element);
            });
            return;
        }

        var post_data = {
            serial: results[element.translation].serial,
            link: element.link,
            referer: element.link,
            translator: results[element.translation].translation,
            season: element.season,
            episode: element.episode
        }
        if (!element.link.startsWith('http')) {
            post_data.referer = results[element.translation].link;
            post_data.host = results[element.translation].host;
            post_data.key = results[element.translation].key;
        }
        //console.log('post_data', post_data);

        network.clear();
        network.timeout(10000);
        network.silent( backend + '&translation='+element.translation + (element.season ? '&season='+element.season : '') + (element.episode ? '&episode='+element.episode : ''), function (str) {
            //console.log('str', str);
            if (str == 'VideoNotFound' || str == '10' || str.indexOf('error') > 0) { return error(str); }

            var result = results[element.translation];
            if (result.serial == 1) {
                if (result.key && typeof(str) === "string") {
                    result.playlists[ element.season ][ element.episode ][ result.max_qual ] = str;
                    //result.playlists[ element.season ][ element.episode ] = {};
                    element.link = str;
                } else {

                    JSON.parse(str).forEach(function (season) {
                        result.host = season.host;
                        result.key = season.key;
                        season.folder.forEach(function (episode) {
                            episode.folder.forEach(function (translation) {
                                var keyt = translator[translation.title];
                                if (keyt != undefined) {
                                    //console.log('keyt', keyt, 'translator', translator, 'translation', translation);
                                    results[ keyt ].playlists[ season.id ][ episode.episode ][ result.max_qual ] = translation.file;
                                    if (keyt == element.translation && season.id == element.season && episode.episode == element.episode && translation.file.substr(-5) === ".m3u8") {
                                        //results[ keyt ].playlists[ season.id ][ episode.episode ] = {};
                                        element.link = translation.file;
                                    }
                                }
                            })
                        })
                    })

                    results.forEach(function (translation) {
                        translation.host = result.host;
                        translation.key = result.key;
                    })

                }
            }
            else {
                result.playlists[ result.max_qual ] = str;
                //result.playlists = {};
                element.link = str;
            }
            extractData(results);

            if (results)
                getStreamQuality(element, function (extra) {
                    return call(element);
                });

        }, function (a, c) {
            return error(network.errorDecode(a, c));
        },
            JSON.stringify(post_data),
            { dataType: 'text' }
        );
      }

    };

    function ZetFlix(component, _object) {
      var network = new Lampa.Reguest();
      var extract = [];
      var results = [];
      var object = _object;
      var filter_items = {};
      var choice = {
        season: 0,
        voice: 0,
        quality: 0
      };
        var translations = [];
        // var backend = 'http://192.168.1.100:3333/zetflixurl?v=801';
        var backend = 'http://freebie.tom.ru/zetflixurl?v=801';
      /**
       * Поиск
       * @param {Object} _object
       */


      this.search = function (_object, kinopoisk_id, similar) {
        object = _object;
        object.kinopoisk_id = kinopoisk_id;
        // console.log('kinopoisk_id', kinopoisk_id, 'similar', similar);

        if (isNaN(kinopoisk_id)) { component.empty("kinopoisk_id is null"); return; }

        var title = object.search;
        if (typeof(similar) == 'object' && !similar.slice().pop().iframe_src) title = kinopoisk_id;

        var url = backend;
        if (isNaN(title) == true) {
            if (title.length < 3) { component.empty('title (' + title + ') is smoll'); return; }
            url += '&id=' + kinopoisk_id + '&title=' + title;
            var relise = object.search_date || (object.movie.number_of_seasons ? object.movie.first_air_date : object.movie.release_date) || '0000';
            var year = parseInt((relise + '').slice(0, 4));
            url += '&year=' + year;
        } else {
            var title = similar.slice().pop();
            url += '&id=' + title.id + '&link=' + title.link;
        }

        network.clear(); network.timeout(20000);
        network.silent( url, function (found) {
            //console.log('found',found);
            if (found && found.result) {
                if (found.action === 'select') {
                    var json = (typeof(found.data) === "string" ? JSON.parse(found.data) : found.data);
                    var similars = [];
                    json.forEach(function (film) {
                      similars.push({
                        id: film.id,
                        title: film.title + (film.year ? ', '+film.year : '') + (film.country ? ', '+film.country : '') + (film.category ? ', '+film.category : ''),
                        year: film.year,
                        link: film.link,
                        filmId: film.id
                      });
                    });
                    component.similars(similars);
                    component.loading(false);
                    return;
                } else if (found.action === 'done') {
                    results = (typeof(found.data) === "string" ? JSON.parse(found.data) : found.data);
                    //console.log('results', results);
                    success(results);
                }
            }
            component.loading(false);
            if (!Object.keys(results).length) component.empty(found.error ? found.error : 'По запросу ('+object.search+') нет результатов');
        }, function (a, c) {
          component.empty(network.errorDecode(a, c));
        });
      };


      this.extendChoice = function (saved) {
        Lampa.Arrays.extend(choice, saved, true);
      };
      /**
       * Сброс фильтра
       */


      this.reset = function () {
        component.reset();
        choice = {
          season: 0,
          voice: 0,
          quality: 0
        };
        filter();
        append(filtred());
        component.saveChoice(choice);
      };
      /**
       * Применить фильтр
       * @param {*} type
       * @param {*} a
       * @param {*} b
       */


      this.filter = function (type, a, b) {
        choice[a.stype] = b.index;
        component.reset();
        filter();
        append(filtred());
        component.saveChoice(choice);
      };
      /**
       * Уничтожить
       */


      this.destroy = function () {
        network.clear();
        results = null;
      };
      /**
       * Успешно, есть данные
       * @param {Object} json
       */


      function success(json) {
        // уже присвоен results = json;
        extractData(json);
        filter();
        append(filtred());
      }
      /**
       * Получить потоки
       * @param {String} str
       * @param {Int} max_quality
       * @returns string
       */


      function extractData(json) {
        extract = [];
        translations = [];
        results.forEach( function (translation, keyt) {
          if (translation == null) return;
          //console.log('translation', translation);

          if (translations.indexOf(translation) == -1) { translations[keyt] = translation; }
          if (translation.serial == 1) {
              extract[keyt] = { json : [], "file": translation.link, 'serial': translation.serial, translation : translation.translation }
              translation.playlists.forEach(function (seasons, keys) {
                  if (seasons == null) return;
                  //console.log('keys', keys, 'seasons', seasons);

                  extract[keyt].last_season = keys;
                  var folder = [];
                  seasons.forEach(function (episode, keye) {
                      if (episode == null) return;
                      //console.log('keye', keye, 'episode', episode);

                        var qualities = Object.keys(episode);
                        //if (qualities) qualities = qualities.filter( function (elem) { return parseInt(elem) <= parseInt(????) && parseInt(elem) !== 0 });
                        var qualitie = Math.max.apply(null, qualities);
                        var link = episode[qualitie];

                        folder[keye] = {
                            "id": keys + '_' + keye,
                            "comment": keye + ' ' + Lampa.Lang.translate('torrent_serial_episode') + ' <i>' + qualitie + '</i>',
                            "file": link,
                            "episode": keye,
                            "season": keys,
                            "quality": qualitie,
                            "qualities": qualities,
                            "translation": keyt, //translation,
                        };

                  })
                  extract[keyt].json[keys] = { "id": keys, "comment": keys + " сезон", "folder": folder, "translation": keyt };
              })
          } else if (translation.serial == 0) {
              var qualities = (translation.playlists == undefined ? [] : Object.keys(translation.playlists));
              if (qualities.length > 1) {
                  var qualitie = qualities.slice().pop();
                  var link = translation.playlists[qualitie];
                  extract[keyt] = { json : {}, "file": link, translation : translation.translation, "quality": qualitie, "qualities": qualities, 'serial': translation.serial, subtitles: translation.subtitles };
              } else {
                  var qualitie = translation.quality;
                  var link = '123';
                  //extract[keyt] = { json : {}, "file": link, translation : translation.translation, "quality": qualitie, "qualities": qualities, 'serial': translation.serial, subtitles: translation.subtitles };
              }
          }
        })
        //console.log('extract', extract);
      }
      /**
       * Найти поток
       * @param {Object} element
       * @param {Int} max_quality
       * @returns string
       */


      function getFile(element, max_quality) {
        var file = '';
        var quality = false;
        var qualities =null;

        //console.log('element', element, 'max_quality', max_quality);
        if (element.season) {
            file = extract[element.translation].json[element.season].folder[element.episode].file;
            qualities = extract[element.translation].json[element.season].folder[element.episode].qualities;
            quality = results[element.translation].playlists[element.season][element.episode];
            // file = quality[max_quality];
        }
        else {
            file = extract[element.translation].file;
            qualities = extract[element.translation].qualities;
            quality = results[element.translation].playlists;
            // file = quality[max_quality];
        }
        //console.log('file', file, 'qualities', qualities);

        return {
          file: file,
          quality: quality
        };
      }
      /**
       * Построить фильтр
       */


      function filter() {
        filter_items = {
          season: [],
          voice: [],
          voice_info: [],
          quality : []
        };
        extract.forEach( function (translation, keyt) {
            if (translation.serial == 0) {

            } else if (translation.serial == 1) {

                var s = translation.last_season;
                while (s--) {
                    if (filter_items.season.indexOf(Lampa.Lang.translate('torrent_serial_season') + ' ' + (translation.last_season - s)) == -1)
                        filter_items.season.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + (translation.last_season - s));
                }

                if (translation.json[choice.season + 1]) {
                    if (filter_items.voice.indexOf(translation.translation) == -1) {
                        filter_items.voice[keyt] = translation.translation;
                        filter_items.voice_info[keyt] = { id: keyt };
                    }
                }

            }

        })
        //console.log('choice.voice', choice.voice, 'filter_items',filter_items);
        if (filter_items.voice_info.length > 0 && !filter_items.voice_info[choice.voice]) {
            choice.voice = undefined;
            filter_items.voice_info.forEach( function (voice_info) {
                if (choice.voice == undefined) choice.voice = voice_info.id;
            })
        }
        component.filter(filter_items, choice);
      }
      /**
       * Отфильтровать файлы
       * @returns array
       */


      function filtred() {
        var filtred = [];
        var filter_data = Lampa.Storage.get('online_filter', '{}');

        extract.forEach(function (translation, keyt) {
            if (translation == null) return;
            if (translation.serial == 1) {
                translation.json.forEach(function (seasons, keys) {
                    if ( keys == filter_data.season + 1 ) {
                        seasons.folder.forEach(function (episode, keye) {
                            if (episode.translation == filter_items.voice_info[filter_data.voice].id) {
                              filtred.push({
                                episode: parseInt(episode.episode),
                                season: episode.season,
                                title: episode.episode + (episode.title ? ' - ' + episode.title : ''),
                                //quality: episode.quality + 'p',
                                quality: (episode.qualities.length > 1 ? episode.quality+'p' : results[keyt].quality ),
                                translation: episode.translation
                              });
                            }
                        })
                    }
                })
            } else {
                filtred.push({
                    title: translation.translation,
                    quality: (translation.qualities.length > 1 ? translation.quality : results[keyt].quality ),
                    translation: keyt,
                    subtitles: parseSubtitles(translation.subtitles),
                });
            }
        })

        //console.log('filtred', filtred);
        return filtred;
      }
      /**
       * Добавить видео
       * @param {Array} items
       */


      function append(items) {
        component.reset();
        var viewed = Lampa.Storage.cache('online_view', 5000, []);
        var last_episode = component.getLastEpisode(items);
        items.forEach(function (element) {
          if (element.season) element.title = 'S' + element.season + ' / ' + Lampa.Lang.translate('torrent_serial_episode') + ' ' + element.episode;
          element.info = element.season ? ' / ' + Lampa.Utils.shortText(filter_items.voice[choice.voice], 50) : '';

          if (element.season) {
            element.translate_episode_end = last_episode;
            element.translate_voice = filter_items.voice[choice.voice];
          }

          var hash = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title].join('') : object.movie.original_title);
          var view = Lampa.Timeline.view(hash);
          var item = Lampa.Template.get('online', element);
          var hash_file = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title, filter_items.voice[choice.voice]].join('') : object.movie.original_title + element.title);
          item.addClass('video--stream');
          element.timeline = view;
          item.append(Lampa.Timeline.render(view));

          if (Lampa.Timeline.details) {
            item.find('.online__quality').append(Lampa.Timeline.details(view, ' / '));
          }

          if (viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
          item.on('hover:enter', function () {
            if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);

            if (element.loading) return;
            element.loading = true;
            getStream(element, function (extra) {
              extra = getFile(extra, extra.quality);
              var first = {
                url: extra.file,
                timeline: view,
                quality: extra.quality,
                title: element.title
              };
              Lampa.Player.play(first);

              if (element.season && Lampa.Platform.version) {
                var playlist = [];
                items.forEach(function (elem) {
                  var cell = {
                    url: function url(call) {
                      getStream(elem, function (extra) {
                        extra = getFile(extra, extra.quality);
                        cell.url = extra.file;
                        cell.quality = extra.quality;
                        call();
                      }, function () {
                        cell.url = '';
                        call();
                      });
                    },
                    timeline: elem.timeline,
                    title: elem.title
                  };
                  if (elem == element) cell.url = extra.file;
                  playlist.push(cell);
                });
                Lampa.Player.playlist(playlist);
              } else {
                Lampa.Player.playlist([first]);
              }

              element.loading = false;
              if (element.subtitles && Lampa.Player.subtitles) Lampa.Player.subtitles(element.subtitles);

              if (viewed.indexOf(hash_file) == -1) {
                viewed.push(hash_file);
                item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
                Lampa.Storage.set('online_view', viewed);
              }
            }, function (error) {
              element.loading = false;
              Lampa.Noty.show(error || Lampa.Lang.translate('online_nolink'));
            });

          });
          component.append(item);
          component.contextmenu({
            item: item,
            view: view,
            viewed: viewed,
            hash_file: hash_file,
            element: element,
            file: function file(call) {
              getStream(element, function (extra) {
                extra = getFile(extra, extra.quality);
                call({
                  file: extra.file,
                  quality: extra.quality,
                });
              });
            }
          });
        });
        component.start(true);      }

      function getStream(element, call, error) {
        if (element.season)
            element.link = extract[element.translation].json[element.season].folder[element.episode].file;
        else element.link = extract[element.translation].file;

        //console.log('element', element);
        if (element.link.startsWith('http') && (element.link.substr(-5) === ".m3u8" || element.link.substr(-4) === ".mp4")) {
            if ( results[element.translation].serial == 0 &&  Object.keys(results[element.translation].playlists).length > 1)
                return call(element);
            if ( results[element.translation].serial == 1 &&  Object.keys(results[element.translation].playlists[ element.season ][ element.episode ]).length > 1)
                return call(element);
        } else {
          var url = backend;
          url += '&id=' + results[element.translation].filmId + '&link='+element.link + '&translation='+element.translation + '&season='+element.season + '&episode='+element.episode;
          network.clear();
          network.timeout(10000);
          //console.log('url', url);
          network.silent( url, function (json) {
              //console.log('json', json);

              json = (typeof(json) === "string" ? JSON.parse(json) : json);
              if (json && json.result) {
                  if (json.action === 'done') {
                      results = json.data;
                      success(results);
                      // element.link = extract[element.translation].file;
                      // element.quality = extract[element.translation].quality;
                      // element.subtitles = parseSubtitles(json.subtitles);
                      return call(element);
                  }
              }

          }, function (a, c) {
              return error(network.errorDecode(a, c));
          },
              false, { dataType: 'text' }
          );
        }
      };

      function parseSubtitles(subtitle) {
        //console.log('subtitle', subtitle);
        if (subtitle == 'false' || subtitle == undefined) return null;
        if (subtitle) {
          var index = -1;
          return subtitle.split(',').map(function (sb) {
            var sp = sb.split(']');
            index++;
            return {
              label: sp[0].slice(1),
              url: sp.pop(),
              index: index
            };
          });
        }
      }

    };


    function component(object) {
      var network = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true
      });
      var files = new Lampa.Files(object);
      var filter = new Lampa.Filter(object);
      var balanser = Lampa.Storage.get('online_balanser', 'Filmix');
      var last_bls = Lampa.Storage.cache('online_last_balanser', 200, {});

      if (last_bls[object.movie.id]) {
        balanser = last_bls[object.movie.id];
      }

      this.proxy = function (name) {
        var prox = Lampa.Storage.get('online_proxy_all');
        var need = Lampa.Storage.get('online_proxy_' + name);
        if (need) prox = need;

        if (prox && prox.slice(-1) !== '/') {
          prox += '/';
        }

        return prox;
      };

      var sources = {
        // videocdn: new videocdn(this, object),
        // rezka: new rezka(this, object),
        // kinobase: new kinobase(this, object),
        // collaps: new collaps(this, object),
        // cdnmovies: new cdnmovies(this, object),
        Filmix: new Filmix(this, object),
        HDRezka: new HDRezka(this, object),
        HDVB: new HDVB(this, object),
        ZetFlix: new ZetFlix(this, object),
        // Bazon: new Bazon(this, object),
        // Bazon_api: new Bazon_api(this, object),
        // IFrame: new IFrame(this, object),
        // Kholobok: new Kholobok(this, object),
      };
      var last;
      var last_filter;
      var extended;
      var selected_id;
      var filter_translate = {
        season: Lampa.Lang.translate('torrent_serial_season'),
        voice: Lampa.Lang.translate('torrent_parser_voice'),
        source: Lampa.Lang.translate('settings_rest_source'),
        quality: Lampa.Lang.translate('torrent_parser_quality')
      };
      // var filter_sources = ['videocdn', 'rezka', 'kinobase', 'collaps', 'cdnmovies', 'filmix']; // шаловливые ручки
      var filter_sources = ['Filmix', /*'HDRezka',*/ 'HDVB', /*'ZetFlix', 'Bazon', 'Bazon_api', 'IFrame', 'Kholobok'*/ ]; // шаловливые ручки

      if (filter_sources.indexOf(balanser) == -1) {
        // balanser = 'videocdn';
        // Lampa.Storage.set('online_balanser', 'videocdn');
        balanser = 'Filmix';
        Lampa.Storage.set('online_balanser', 'Filmix');
      }

      scroll.body().addClass('torrent-list');

      function minus() {
        scroll.minus(window.innerWidth > 580 ? false : files.render().find('.files__left'));
      }

      window.addEventListener('resize', minus, false);
      minus();
      /**
       * Подготовка
       */

      this.create = function () {
        var _this = this;

        this.activity.loader(true);
        Lampa.Background.immediately(Lampa.Utils.cardImgBackground(object.movie));

        filter.onSearch = function (value) {
          object.search_new = true;
          Lampa.Activity.replace({
            search: value,
            clarification: true
          });
        };

        filter.onBack = function () {
          _this.start();
        };

        filter.render().find('.selector').on('hover:focus', function (e) {
          last_filter = e.target;
        });

        filter.onSelect = function (type, a, b) {
          if (type == 'filter') {
            if (a.reset) {
              if (extended) sources[balanser].reset();else _this.start();
            } else {
              sources[balanser].filter(type, a, b);
            }
          } else if (type == 'sort') {
            balanser = a.source;
            Lampa.Storage.set('online_balanser', balanser);
            last_bls[object.movie.id] = balanser;
            Lampa.Storage.set('online_last_balanser', last_bls);

            _this.search();

            setTimeout(Lampa.Select.close, 10);
          }
        };

        filter.render().find('.filter--sort span').text(Lampa.Lang.translate('online_balanser'));
        filter.render();
        files.append(scroll.render());
        scroll.append(filter.render());
        this.search();
        return this.render();
      };
      /**
       * Начать поиск
       */


      this.search = function () {
        this.activity.loader(true);
        this.filter({
          source: filter_sources
        }, {
          source: 0
        });
        this.reset();
        this.find();
      };

      this.find = function () {
        var _this2 = this;

        var url = this.proxy('videocdn') + 'http://cdn.svetacdn.in/api/short';
        var query = object.search;
        url = Lampa.Utils.addUrlComponent(url, 'api_token=3i40G5TSECmLF77oAqnEgbx61ZWaOYaE');

        var display = function display(json) {
          if (object.movie.imdb_id) {
            var imdb = json.data.filter(function (elem) {
              return elem.imdb_id == object.movie.imdb_id;
            });
            if (imdb.length) json.data = imdb;
          }

          if (json.data && json.data.length) {
            if (json.data.length == 1 || object.clarification) {
              _this2.extendChoice();

              if (balanser == 'videocdn' || balanser == 'filmix') sources[balanser].search(object, json.data); else sources[balanser].search(object, json.data[0].kp_id || json.data[0].filmId || json.data[0].kinopoiskId, json.data);
            } else {
              _this2.similars(json.data);

              _this2.loading(false);
            }
          } else _this2.emptyForQuery(query);
        };

        var pillow = function pillow(a, c) {
          network.timeout(1000 * 15);

          if (balanser !== 'videocdn') {
            network["native"]('https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(query), function (json) {
              json.data = json.films || json.items;
              display(json);
            }, function (a, c) {
              _this2.empty(network.errorDecode(a, c));
            }, false, {
              headers: {
                'X-API-KEY': '2d55adfd-019d-4567-bbf7-67d503f61b5a'
              }
            });
          } else {
            _this2.empty(network.errorDecode(a, c));
          }
        };

        var letgo = function letgo(imdb_id) {
          var url_end = Lampa.Utils.addUrlComponent(url, imdb_id ? 'imdb_id=' + encodeURIComponent(imdb_id) : 'title=' + encodeURIComponent(query));
          network.timeout(1000 * 15);
          network["native"](url_end, function (json) {
            if (json.data && json.data.length) display(json);else {
              network["native"](Lampa.Utils.addUrlComponent(url, 'title=' + encodeURIComponent(query)), display.bind(_this2), pillow.bind(_this2));
            }
          }, pillow.bind(_this2));
        };

        var letgo_new = function letgo_new(tmdb_id) {
            network["native"]('http://freebie.tom.ru/lampa-lite/kinopoiskId?v=801&tmdb_id=' + object.movie.id +'&serial=' + (object.movie.number_of_seasons ? 1 : 0) + '&title=' + encodeURIComponent(object.search), function (kinopoisk_id) {
                console.log('object.movie.id', object.movie.id, 'kinopoisk_id', kinopoisk_id);
                if (kinopoisk_id) {
                    object.kinopoisk_id = kinopoisk_id;
                    sources[balanser].search(object, kinopoisk_id);
                  }
                  else pillow();
              }, pillow.bind(_this2), false, { dataType: 'text' }
            );
        };

        network.clear();
        network.timeout(1000 * 15);

        if (object.search_new) { object.search_new = false; object.filmix_id = undefined; object.kinopoisk_id = undefined; }
        if (balanser == 'Filmix') {
            _this2.extendChoice();
            sources[balanser].search(object, (object.filmix_id ? object.filmix_id : object.search));
        } else if (balanser == 'HDRezka') {
            _this2.extendChoice();
            sources[balanser].search(object, object.search);
        } else if (balanser != 'videocdn') {
            _this2.extendChoice();
            if (object.kinopoisk_id) {
                sources[balanser].search(object, object.kinopoisk_id);
            } else {
                letgo_new(object.movie.id);
            }
        } else if (object.movie.imdb_id) {
            letgo(object.movie.imdb_id);
        } else if (object.movie.source == 'tmdb' || object.movie.source == 'cub') {
          network["native"]('http://' + (Lampa.Storage.field('proxy_tmdb') === false ? 'api.themoviedb.org' : 'apitmdb.cub.watch') + '/3/' + (object.movie.name ? 'tv' : 'movie') + '/' + object.movie.id + '/external_ids?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru', function (ttid) {
            letgo(ttid.imdb_id);
          }, function (a, c) {
            _this2.empty(network.errorDecode(a, c));
          });
        } else {
          letgo();
        }
      };

      this.extendChoice = function () {
        var data = Lampa.Storage.cache('online_choice_' + balanser, 500, {});
        var save = data[selected_id || object.movie.id] || {};
        extended = true;
        sources[balanser].extendChoice(save);
      };

      this.saveChoice = function (choice) {
        var data = Lampa.Storage.cache('online_choice_' + balanser, 500, {});
        data[selected_id || object.movie.id] = choice;
        Lampa.Storage.set('online_choice_' + balanser, data);
      };
      /**
       * Есть похожие карточки
       * @param {Object} json
       */


      this.similars = function (json) {
        var _this3 = this;

        json.forEach(function (elem) {
          var year = elem.start_date || elem.year || '';
          elem.title = elem.title || elem.ru_title || elem.en_title || elem.nameRu || elem.nameEn;
          elem.quality = year ? (year + '').slice(0, 4) : '----';
          elem.info = '';
          var item = Lampa.Template.get('online_folder', elem);
          item.on('hover:enter', function () {
            _this3.activity.loader(true);

            _this3.reset();

            object.search_date = year;
            selected_id = elem.id;

            _this3.extendChoice();

            if (balanser == 'videocdn') sources[balanser].search(object, [elem]); else sources[balanser].search(object, elem.kp_id || elem.filmId, [elem]);
          });

          _this3.append(item);
        });
      };
      /**
       * Очистить список файлов
       */


      this.reset = function () {
        last = false;
        scroll.render().find('.empty').remove();
        filter.render().detach();
        scroll.clear();
        scroll.append(filter.render());
      };
      /**
       * Загрузка
       */


      this.loading = function (status) {
        if (status) this.activity.loader(true);else {
          this.activity.loader(false);
          this.activity.toggle();
        }
      };
      /**
       * Построить фильтр
       */


      this.filter = function (filter_items, choice) {
        var select = [];

        var add = function add(type, title) {
          var need = Lampa.Storage.get('online_filter', '{}');
          var items = filter_items[type];
          var subitems = [];
          var value = need[type];
          items.forEach(function (name, i) {
            subitems.push({
              title: name,
              selected: value == i,
              index: i
            });
          });
          select.push({
            title: title,
            subtitle: items[value],
            items: subitems,
            stype: type
          });
        };

        filter_items.source = filter_sources;
        choice.source = filter_sources.indexOf(balanser);
        select.push({
          title: Lampa.Lang.translate('torrent_parser_reset'),
          reset: true
        });
        Lampa.Storage.set('online_filter', choice);
        if (filter_items.voice && filter_items.voice.length) add('voice', Lampa.Lang.translate('torrent_parser_voice'));
        if (filter_items.season && filter_items.season.length) add('season', Lampa.Lang.translate('torrent_serial_season'));
        if (balanser.startsWith('Filmix') || balanser.startsWith('Bazon')) if (filter_items.quality && filter_items.quality.length) add('quality', Lampa.Lang.translate('torrent_parser_quality'));
        filter.set('filter', select);
        filter.set('sort', filter_sources.map(function (e) {
          return {
            title: e,
            source: e,
            selected: e == balanser
          };
        }));
        this.selected(filter_items);
      };
      /**
       * Закрыть фильтр
       */


      this.closeFilter = function () {
        if ($('body').hasClass('selectbox--open')) Lampa.Select.close();
      };
      /**
       * Показать что выбрано в фильтре
       */


      this.selected = function (filter_items) {
        var need = Lampa.Storage.get('online_filter', '{}'),
            select = [];

        for (var i in need) {
          if (filter_items[i] && filter_items[i].length) {
            if (i == 'voice') {
              select.push(filter_translate[i] + ': ' + filter_items[i][need[i]]);
            } else if (i !== 'source') {
              if (filter_items.season.length >= 1) {
                select.push(filter_translate.season + ': ' + filter_items[i][need[i]]);
              }
            }
          }
        }

        filter.chosen('filter', select);
        filter.chosen('sort', [balanser]);
      };
      /**
       * Добавить файл
       */


      this.append = function (item) {
        item.on('hover:focus', function (e) {
          last = e.target;
          scroll.update($(e.target), true);
        });
        scroll.append(item);
      };
      /**
       * Меню
       */


      this.contextmenu = function (params) {
        params.item.on('hover:long', function () {
          function show(extra) {
            var enabled = Lampa.Controller.enabled().name;
            var menu = [{
              title: Lampa.Lang.translate('torrent_parser_label_title'),
              mark: true
            }, {
              title: Lampa.Lang.translate('torrent_parser_label_cancel_title'),
              clearmark: true
            }, {
              title: Lampa.Lang.translate('time_reset'),
              timeclear: true
            }];

            if (Lampa.Platform.is('webos')) {
              menu.push({
                title: Lampa.Lang.translate('player_lauch') + ' - Webos',
                player: 'webos'
              });
            }

            if (Lampa.Platform.is('android')) {
              menu.push({
                title: Lampa.Lang.translate('player_lauch') + ' - Android',
                player: 'android'
              });
            }

            menu.push({
              title: Lampa.Lang.translate('player_lauch') + ' - Lampa',
              player: 'lampa'
            });

            if (extra) {
              menu.push({
                title: Lampa.Lang.translate('copy_link'),
                copylink: true
              });
            }

            if (Lampa.Account.working() && params.element && typeof params.element.season !== 'undefined' && Lampa.Account.subscribeToTranslation) {
              menu.push({
                title: Lampa.Lang.translate('online_voice_subscribe'),
                subscribe: true
              });
            }

            Lampa.Select.show({
              title: Lampa.Lang.translate('title_action'),
              items: menu,
              onBack: function onBack() {
                Lampa.Controller.toggle(enabled);
              },
              onSelect: function onSelect(a) {
                if (a.clearmark) {
                  Lampa.Arrays.remove(params.viewed, params.hash_file);
                  Lampa.Storage.set('online_view', params.viewed);
                  params.item.find('.torrent-item__viewed').remove();
                }

                if (a.mark) {
                  if (params.viewed.indexOf(params.hash_file) == -1) {
                    params.viewed.push(params.hash_file);
                    params.item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
                    Lampa.Storage.set('online_view', params.viewed);
                  }
                }

                if (a.timeclear) {
                  params.view.percent = 0;
                  params.view.time = 0;
                  params.view.duration = 0;
                  Lampa.Timeline.update(params.view);
                }

                Lampa.Controller.toggle(enabled);

                if (a.player) {
                  Lampa.Player.runas(a.player);
                  params.item.trigger('hover:enter');
                }

                if (a.copylink) {
                  if (extra.quality) {
                    var qual = [];

                    for (var i in extra.quality) {
                      qual.push({
                        title: i,
                        file: extra.quality[i]
                      });
                    }

                    Lampa.Select.show({
                      title: 'Ссылки',
                      items: qual,
                      onBack: function onBack() {
                        Lampa.Controller.toggle(enabled);
                      },
                      onSelect: function onSelect(b) {
                        Lampa.Utils.copyTextToClipboard(b.file, function () {
                          Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                        }, function () {
                          Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                        });
                      }
                    });
                  } else {
                    Lampa.Utils.copyTextToClipboard(extra.file, function () {
                      Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                    }, function () {
                      Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                    });
                  }
                }

                if (a.subscribe) {
                  Lampa.Account.subscribeToTranslation({
                    card: object.movie,
                    season: params.element.season,
                    episode: params.element.translate_episode_end,
                    voice: params.element.translate_voice
                  }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate('online_voice_success'));
                  }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate('online_voice_error'));
                  });
                }
              }
            });
          }

          params.file(show);
        }).on('hover:focus', function () {
          if (Lampa.Helper) Lampa.Helper.show('online_file', Lampa.Lang.translate('helper_online_file'), params.item);
        });
      };
      /**
       * Показать пустой результат
       */


      this.empty = function (msg) {
        var empty = Lampa.Template.get('list_empty');
        if (msg) empty.find('.empty__descr').text(msg);
        scroll.append(empty);
        this.loading(false);
      };
      /**
       * Показать пустой результат по ключевому слову
       */


      this.emptyForQuery = function (query) {
        this.empty(Lampa.Lang.translate('online_query_start') + ' (' + query + ') ' + Lampa.Lang.translate('online_query_end'));
      };

      this.getLastEpisode = function (items) {
        var last_episode = 0;
        items.forEach(function (e) {
          if (typeof e.episode !== 'undefined') last_episode = Math.max(last_episode, parseInt(e.episode));
        });
        return last_episode;
      };
      /**
       * Начать навигацию по файлам
       */


      this.start = function (first_select) {
        if (Lampa.Activity.active().activity !== this.activity) return; //обязательно, иначе наблюдается баг, активность создается но не стартует, в то время как компонент загружается и стартует самого себя.

        if (first_select) {
          var last_views = scroll.render().find('.selector.online').find('.torrent-item__viewed').parent().last();
          if (object.movie.number_of_seasons && last_views.length) last = last_views.eq(0)[0];else last = scroll.render().find('.selector').eq(3)[0];
        }

        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(scroll.render(), files.render());
            Lampa.Controller.collectionFocus(last || false, scroll.render());
          },
          up: function up() {
            if (Navigator.canmove('up')) {
              if (scroll.render().find('.selector').slice(3).index(last) == 0 && last_filter) {
                Lampa.Controller.collectionFocus(last_filter, scroll.render());
              } else Navigator.move('up');
            } else Lampa.Controller.toggle('head');
          },
          down: function down() {
            Navigator.move('down');
          },
          right: function right() {
            if (Navigator.canmove('right')) Navigator.move('right');else filter.show(Lampa.Lang.translate('title_filter'), 'filter');
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          back: this.back
        });
        Lampa.Controller.toggle('content');
      };

      this.render = function () {
        return files.render();
      };

      this.back = function () {
        Lampa.Activity.backward();
      };

      this.pause = function () {};

      this.stop = function () {};

      this.destroy = function () {
        network.clear();
        files.destroy();
        scroll.destroy();
        network = null;
        // sources.videocdn.destroy();
        // sources.rezka.destroy();
        // sources.kinobase.destroy();
        // sources.collaps.destroy();
        // sources.cdnmovies.destroy();
        // sources.filmix.destroy();
        sources.Filmix.destroy();
        sources.HDRezka.destroy();
        sources.HDVB.destroy();
        sources.ZetFlix.destroy();
        // sources.Bazon.destroy();
        // sources.Bazon_api.destroy();
        // sources.IFrame.destroy();
        // sources.Kholobok.destroy();
        window.removeEventListener('resize', minus);
      };

      this.whois = function (param) {
        window.whois = { ip : '127.0.0.1' };
        network["native"]('http://freebie.tom.ru/lampa-lite/whois?v=801', function (json) {
          window.whois.ip = json.ip;
          sources[balanser].search(object, param);
      }, function (a, c) {
          sources[balanser].search(object, param);
        });
      };
    }

    if (!Lampa.Lang) {
      var lang_data = {};
      Lampa.Lang = {
        add: function add(data) {
          lang_data = data;
        },
        translate: function translate(key) {
          return lang_data[key] ? lang_data[key].ru : key;
        }
      };
    }

    Lampa.Lang.add({
      online_nolink: {
        ru: 'Не удалось извлечь ссылку',
        uk: 'Неможливо отримати посилання',
        en: 'Failed to fetch link'
      },
      online_waitlink: {
        ru: 'Работаем над извлечением ссылки, подождите...',
        uk: 'Працюємо над отриманням посилання, зачекайте...',
        en: 'Working on extracting the link, please wait...'
      },
      online_balanser: {
        ru: 'Балансер',
        uk: 'Балансер',
        en: 'Balancer'
      },
      helper_online_file: {
        ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню',
        uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
        en: 'Hold the "OK" key to bring up the context menu'
      },
      online_query_start: {
        ru: 'По запросу',
        uk: 'На запит',
        en: 'On request'
      },
      online_query_end: {
        ru: 'нет результатов',
        uk: 'немає результатів',
        en: 'no results'
      },
      title_online: {
        ru: 'Онлайн',
        uk: 'Онлайн',
        en: 'Online'
      },
      title_filmix: {
        ru: 'Filmix',
        uk: 'Filmix',
        en: 'Filmix',
      },
      title_proxy: {
        ru: 'Прокси',
        uk: 'Проксі',
        en: 'Proxy'
      },
      online_proxy_title: {
        ru: 'Основной прокси',
        uk: 'Основний проксі',
        en: 'Main proxy'
      },
      online_proxy_descr: {
        ru: 'Будет использоваться для всех балансеров',
        uk: 'Використовуватиметься для всіх балансерів',
        en: 'Will be used for all balancers'
      },
      online_proxy_placeholder: {
        ru: 'Например: http://proxy.com',
        uk: 'Наприклад: http://proxy.com',
        en: 'For example: http://proxy.com'
      },
      filmix_param_add_title: {
        ru: 'Добавить ТОКЕН от Filmix',
        uk: 'Додати ТОКЕН від Filmix',
        en: 'Add TOKEN from Filmix'
      },
      filmix_param_add_descr: {
        ru: 'Добавьте ТОКЕН для подключения подписки',
        uk: 'Додайте ТОКЕН для підключення передплати',
        en: 'Add a TOKEN to connect a subscription'
      },
      filmix_param_placeholder: {
        ru: 'Например: nxjekeb57385b..',
        uk: 'Наприклад: nxjekeb57385b..',
        en: 'For example: nxjekeb57385b..'
      },
      filmix_param_add_device: {
        ru: 'Добавить устройство на Filmix',
        uk: 'Додати пристрій на Filmix',
        en: 'Add Device to Filmix'
      },
      filmix_modal_text: {
        ru: 'Введите его на странице https://filmix.ac/consoles в вашем авторизованном аккаунте!',
        uk: 'Введіть його на сторінці https://filmix.ac/consoles у вашому авторизованому обліковому записі!',
        en: 'Enter it at https://filmix.ac/consoles in your authorized account!'
      },
      filmix_modal_wait: {
        ru: 'Ожидаем код',
        uk: 'Очікуємо код',
        en: 'Waiting for the code'
      },
      filmix_copy_secuses: {
        ru: 'Код скопирован в буфер обмена',
        uk: 'Код скопійовано в буфер обміну',
        en: 'Code copied to clipboard'
      },
      filmix_copy_fail: {
        ru: 'Ошибка при копировании',
        uk: 'Помилка при копіюванні',
        en: 'Copy error'
      },
      filmix_nodevice: {
        ru: 'Устройство не авторизовано',
        uk: 'Пристрій не авторизований',
        en: 'Device not authorized'
      },
      title_status: {
        ru: 'Статус',
        uk: 'Статус',
        en: 'Status'
      },
      online_voice_subscribe: {
        ru: 'Подписаться на перевод',
        uk: 'Підписатися на переклад',
        en: 'Subscribe to translation'
      },
      online_voice_success: {
        ru: 'Вы успешно подписались',
        uk: 'Ви успішно підписалися',
        en: 'You have successfully subscribed'
      },
      online_voice_error: {
        ru: 'Возникла ошибка',
        uk: 'Виникла помилка',
        en: 'An error has occurred'
      }
    });

    function resetTemplates() {
      Lampa.Template.add('online', "<div class=\"online selector\">\n        <div class=\"online__body\">\n            <div style=\"position: absolute;left: 0;top: -0.3em;width: 2.4em;height: 2.4em\">\n                <svg style=\"height: 2.4em; width:  2.4em;\" viewBox=\"0 0 128 128\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <circle cx=\"64\" cy=\"64\" r=\"56\" stroke=\"white\" stroke-width=\"16\"/>\n                    <path d=\"M90.5 64.3827L50 87.7654L50 41L90.5 64.3827Z\" fill=\"white\"/>\n                </svg>\n            </div>\n            <div class=\"online__title\" style=\"padding-left: 2.1em;\">{title}</div>\n            <div class=\"online__quality\" style=\"padding-left: 3.4em;\">{quality}{info}</div>\n        </div>\n    </div>");
      Lampa.Template.add('online_folder', "<div class=\"online selector\">\n        <div class=\"online__body\">\n            <div style=\"position: absolute;left: 0;top: -0.3em;width: 2.4em;height: 2.4em\">\n                <svg style=\"height: 2.4em; width:  2.4em;\" viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"/>\n                    <path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"/>\n                    <rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"/>\n                </svg>\n            </div>\n            <div class=\"online__title\" style=\"padding-left: 2.1em;\">{title}</div>\n            <div class=\"online__quality\" style=\"padding-left: 3.4em;\">{quality}{info}</div>\n        </div>\n    </div>");
    }

    var button = "<div class=\"full-start__button selector view--online\" data-subtitle=\"Источник Filmix\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:svgjs=\"http://svgjs.com/svgjs\" version=\"1.1\" width=\"512\" height=\"512\" x=\"0\" y=\"0\" viewBox=\"0 0 30.051 30.051\" style=\"enable-background:new 0 0 512 512\" xml:space=\"preserve\" class=\"\">\n    <g xmlns=\"http://www.w3.org/2000/svg\">\n        <path d=\"M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069   c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532   c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z\" fill=\"currentColor\"/>\n        <path d=\"M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021   C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518   c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z\" fill=\"currentColor\"/>\n    </g></svg>\n\n    <span>#{title_filmix}</span>\n    </div>"; // нужна заглушка, а то при страте лампы говорит пусто

    Lampa.Component.add('Filmix', component); //то же самое

    resetTemplates();
    Lampa.Listener.follow('full', function (e) {
      if (e.type == 'complite') {
        var btn = $(Lampa.Lang.translate(button));
        btn.on('hover:enter', function () {
          resetTemplates();
          Lampa.Component.add('Filmix', component);
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('title_filmix'),
            component: 'Filmix',
            search: e.data.movie.title,
            search_one: e.data.movie.title,
            search_two: e.data.movie.original_title,
            movie: e.data.movie,
            page: 1
          });
        });
        e.object.activity.render().find('.view--torrent').after(btn);
      }
    }); ///////ONLINE/////////

})();
