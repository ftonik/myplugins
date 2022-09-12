(function() {
    'use strict';
	
    Lampa.Listener.follow('full', function(e) {
        if (e.type == 'complite') {
            $(".view--trailer").each(function(){var div = $(this).parent('div');div.find('.open--menu').insertBefore($(this))});
			$(".full-start__icons > .info__icon",Lampa.Activity.active().activity.render()).css({'background-image':'url("")', 'padding':'0.7em'});
	
			setTimeout(function(){
				$(".view--online",Lampa.Activity.active().activity.render()).empty().append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>Смотреть</span>");
				$(".view--streamv1",Lampa.Activity.active().activity.render()).empty().append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>Смотреть</span>");
				$(".view--bazon",Lampa.Activity.active().activity.render()).empty().append("<svg enable-background='new 0 0 64 64' height='64px' id='Layer_1' version='1.1' viewBox='0 0 64 64' width='64px' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><circle cx='32' cy='32' fill='#77B3D4' r='32'/><circle cx='32' cy='33.917' fill='#231F20' opacity='0.2' r='13.083'/><circle cx='32' cy='33.083' fill='#4F5D73' r='13.083'/><circle cx='32' cy='32' fill='#4F5D73' r='13.083'/><g opacity='0.2'><path d='M32,12c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,12,32,12z M14.5,30.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.037-2.463,5.5-5.5,5.5C16.962,36,14.5,33.537,14.5,30.5z M24.469,49.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C29.969,47.037,27.506,49.5,24.469,49.5z    M26.5,21.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,27,26.5,24.538,26.5,21.5z    M39.469,49.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5   C44.969,47.037,42.506,49.5,39.469,49.5z M44.042,36c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5   c3.037,0,5.5,2.462,5.5,5.5C49.542,33.537,47.079,36,44.042,36z' fill='#231F20'/></g><g><path d='M32,10c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,10,32,10z M14.5,28.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C16.962,34,14.5,31.538,14.5,28.5z M24.469,47.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C29.969,45.037,27.506,47.5,24.469,47.5z    M26.5,19.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,25,26.5,22.538,26.5,19.5z    M39.469,47.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5   C44.969,45.037,42.506,47.5,39.469,47.5z M44.042,34c-3.038,0-5.5-2.462-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5   c3.037,0,5.5,2.462,5.5,5.5C49.542,31.538,47.079,34,44.042,34z' fill='#FFFFFF'/></g></svg><span>Bazon</span>");
				$(".view--filmixpva",Lampa.Activity.active().activity.render()).empty().append("<svg enable-background='new 0 0 64 64' height='64px' id='Layer_1' version='1.1' viewBox='0 0 64 64' width='64px' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><circle cx='32' cy='32' fill='#77B3D4' r='32'/><circle cx='32' cy='33.917' fill='#231F20' opacity='0.2' r='13.083'/><circle cx='32' cy='33.083' fill='#4F5D73' r='13.083'/><circle cx='32' cy='32' fill='#4F5D73' r='13.083'/><g opacity='0.2'><path d='M32,12c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,12,32,12z M14.5,30.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.037-2.463,5.5-5.5,5.5C16.962,36,14.5,33.537,14.5,30.5z M24.469,49.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C29.969,47.037,27.506,49.5,24.469,49.5z    M26.5,21.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,27,26.5,24.538,26.5,21.5z    M39.469,49.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5   C44.969,47.037,42.506,49.5,39.469,49.5z M44.042,36c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5   c3.037,0,5.5,2.462,5.5,5.5C49.542,33.537,47.079,36,44.042,36z' fill='#231F20'/></g><g><path d='M32,10c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,10,32,10z M14.5,28.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C16.962,34,14.5,31.538,14.5,28.5z M24.469,47.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C29.969,45.037,27.506,47.5,24.469,47.5z    M26.5,19.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,25,26.5,22.538,26.5,19.5z    M39.469,47.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5   C44.969,45.037,42.506,47.5,39.469,47.5z M44.042,34c-3.038,0-5.5-2.462-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5   c3.037,0,5.5,2.462,5.5,5.5C49.542,31.538,47.079,34,44.042,34z' fill='#FFFFFF'/></g></svg><span>Filmix</span>");
			},20); 
						
			$(".view--torrent",Lampa.Activity.active().activity.render()).empty().append("<svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 48 48' width='48px' height='48px'><path fill='#4caf50' fill-rule='evenodd' d='M23.501,44.125c11.016,0,20-8.984,20-20 c0-11.015-8.984-20-20-20c-11.016,0-20,8.985-20,20C3.501,35.141,12.485,44.125,23.501,44.125z' clip-rule='evenodd'/><path fill='#fff' fill-rule='evenodd' d='M43.252,27.114C39.718,25.992,38.055,19.625,34,11l-7,1.077 c1.615,4.905,8.781,16.872,0.728,18.853C20.825,32.722,17.573,20.519,15,14l-8,2l10.178,27.081c1.991,0.67,4.112,1.044,6.323,1.044 c0.982,0,1.941-0.094,2.885-0.232l-4.443-8.376c6.868,1.552,12.308-0.869,12.962-6.203c1.727,2.29,4.089,3.183,6.734,3.172 C42.419,30.807,42.965,29.006,43.252,27.114z' clip-rule='evenodd'/></svg><span>Торренты</span>");
			$(".open--menu",Lampa.Activity.active().activity.render()).empty().append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>Смотреть</span>");
			$(".view--trailer",Lampa.Activity.active().activity.render()).empty().append("<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'><g><path d='m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 3.4 2.16 2.48 129.93 0 132-5.5 4.55-186.38 4-190.26 0z' fill='#191919'/><path d='m130.77 245.35h-4.49c-24.1 0-46.88-.35-64.17-.88-32.45-1-33.59-2.18-36.09-4.75s-4.54-4.72-4.42-71.52c0-16.69.25-32.56.61-44.68.69-23 1.49-24 3.26-26.29 2.61-3.34 6.09-3.48 14.52-3.83 5.12-.21 12.4-.4 21.63-.55 17.1-.28 40-.44 64.59-.44s47.61.16 64.93.44c32 .52 32.85 1.08 35.18 2.56 4 2.53 4.44 6.86 4.95 14.94 1 16.3 1.11 49.25.87 72.51-.56 53.77-1.68 54.7-5 57.45-2.44 2-4.06 3.36-36.37 4.32-16.06.46-37.23.72-60 .72zm-92.05-18c26.43 2.62 150.17 2.66 176.21.07 1.41-20.23 2-97 .31-118-27.17-1.42-148.84-1.42-176.47 0-1.58 21.46-1.62 98-.05 117.93z' fill='#191919'/></g><g><path d='m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 3.4 2.16 2.48 129.93 0 132-5.5 4.55-186.38 4-190.26 0z' fill='#e83a2a'/></g><path d='m223.21 123.51c.74-1.1.94-31.2-1-32-5.6-2.46-186.21-2.29-190.8.49-1.74 1-1.88 30.31-1.1 31.55s192.16 1.06 192.9-.04z' fill='#191919'/><path d='m120.37 132.4c-28.37 0-57.78-.1-75.37-.4-4.73-.07-8.4-.15-10.92-.23-4.74-.16-8.17-.27-10.53-4-1.15-1.83-1.85-2.94-1.65-18 .08-6.37.37-14.77 1.29-18.61a9.26 9.26 0 0 1 4.13-6.05c2.23-1.34 3.46-2.08 34.93-2.73 17-.35 39.77-.57 64.21-.62 24.07 0 46.95.08 64.39.36 31.12.49 32.73 1.19 34.58 2a8.75 8.75 0 0 1 4.92 5.88c.32 1.1 1.31 4.43 1.39 19.28.08 15.72-.65 16.83-1.88 18.66-2.42 3.61-5.14 3.68-12.43 3.86-3.69.09-9 .18-15.88.25-12.8.14-30.33.24-50.71.3-9.57.04-19.94.05-30.47.05zm-82.52-16.48c29.32.63 148.34.59 177.85-.05.09-5.19 0-12.37-.26-17.08-27.44-1.5-150.44-1.22-177.2.41-.3 4.63-.43 11.64-.39 16.72z' fill='#191919'/><path d='m223.21 123.51c.74-1.1.94-31.2-1-32-5.6-2.46-186.21-2.29-190.8.49-1.74 1-1.88 30.31-1.1 31.55s192.16 1.06 192.9-.04z' fill='#fff'/><path d='m28.25 125.61s38.89-36.44 38.35-37.61c-.79-1.66-38-1.52-38.84-.43s-6.56 40.6.49 38.04z' fill='#191919'/><path d='m221.34 51.57c.57-1.2-3.72-29.95-5.73-30.48-5.92-1.58-184.88 24.52-189.04 27.91-1.57 1.32 2.6 30.29 3.56 31.4s190.65-27.63 191.21-28.83z' fill='#191919'/><path d='m30.56 88.4a7.85 7.85 0 0 1 -6.51-2.79c-1.4-1.61-2.25-2.61-4.28-17.56-.86-6.31-1.81-14.67-1.47-18.6a9.26 9.26 0 0 1 3.19-6.6c2-1.66 3.13-2.57 34.23-7.75 16.74-2.79 39.31-6.28 63.55-9.84 23.84-3.5 46.52-6.66 63.87-8.9 30.9-4 32.58-3.53 34.53-3a8.81 8.81 0 0 1 5.78 5.13c1.29 2.78 2.71 8.93 4.22 18.28 2.42 15 1.85 16.23.9 18.23-1.86 3.92-4.4 4.37-11.93 5.69-3.76.66-9.21 1.57-16.2 2.7-13.08 2.11-30.91 4.9-51.56 8.06-36.08 5.55-82.61 12.45-105.23 15.48-4 .54-7.1.93-9.23 1.17a35 35 0 0 1 -3.86.3zm3.83-33.23c.38 4.63 1.29 11.55 2.08 16.56 29.15-3.73 147.12-21.54 176.29-26.59-.68-4.9-1.79-11.49-2.74-15.85-27.27 2.43-149.27 20.41-175.63 25.88z' fill='#191919'/><path d='m221.34 51.57c.57-1.2-3.72-29.95-5.73-30.48-5.92-1.58-184.88 24.52-189.04 27.91-1.57 1.32 2.6 30.29 3.56 31.4s190.65-27.63 191.21-28.83z' fill='#fff'/><path d='m26.57 49s40.36 28.35 40 29.57c-.53 1.76-37.35 7.09-38.35 6.13s-9.01-37.16-1.65-35.7z' fill='#191919'/><path d='m64.63 38.94c-.18 1 43.79 34.37 46 34l37.83-5.62c1.92-.29-44.9-35.19-47.14-34.86s-36.51 5.47-36.69 6.48z' fill='#191919'/><path d='m142.53 27.36c-.18 1 43.79 34.37 46 34l37.83-5.62c1.92-.29-44.9-35.19-47.14-34.86s-36.51 5.48-36.69 6.48z' fill='#191919'/><path d='m70.55 125.77c-.32-1 38.25-40.43 40.51-40.43h38.25c1.94 0-39.22 41.4-41.49 41.4s-36.95 0-37.27-.97z' fill='#191919'/><path d='m149.31 125.77c-.32-1 38.25-40.43 40.51-40.43s34.36.65 34.36 2.59c0 .65-35.33 38.82-37.6 38.82s-36.95-.01-37.27-.98z' fill='#191919'/><g><path d='m129.27 217.89c-15.12 0-30.17-.12-41.29-.32-20.22-.37-20.88-.8-22.06-1.57-1.94-1.25-2.44-3.15-2.83-10.66-.34-6.72-.44-17.33-.24-27 .37-18.14 1.21-18.82 2.74-20 1.37-1.1 1.48-1.19 21-1.39 10.56-.11 24.73-.17 39.89-.17 58.31 0 59.89.63 60.73 1 2.82 1.13 3.22 3.93 3.58 11.09.33 6.65.4 17.33.17 27.21-.11 4.76-.28 8.87-.49 11.87-.33 4.81-.6 7.17-2.91 8.37-1.05.43-3.25 1.57-58.29 1.57z' fill='#fff'/><path d='m126.48 160.7c29 0 58.11.23 59.25.68 2.1.84 1.54 50.47 0 51.27s-28.7 1.25-56.45 1.25c-29.58 0-59.95-.44-61.19-1.25-1.93-1.25-1.65-49.94 0-51.27.57-.45 29.41-.68 58.39-.68m0-8c-15.18 0-29.36.06-39.94.17-5.71.06-10.21.13-13.38.22-5.82.15-7.78.2-10.09 2.06-3.18 2.56-3.44 6.28-3.76 11-.21 3.08-.37 7.26-.47 12.11-.2 9.8-.1 20.53.25 27.33.33 6.48.57 11.15 4.65 13.79 2.21 1.43 2.8 1.81 24.17 2.21 11.14.21 26.22.32 41.37.32 14.62 0 28.17-.11 38.17-.3 19.15-.38 20.09-.87 22-1.84 4.4-2.29 4.72-6.83 5.05-11.64.21-3.06.38-7.22.5-12 .23-10 .16-20.75-.18-27.5-.13-2.55-.29-4.53-.49-6-.25-1.83-.9-6.7-5.6-8.57-1.69-.67-2.2-.88-22.07-1.08-10.71-.11-25-.17-40.15-.17z' fill='#191919'/></g><path d='m83.5 173.88c-5.25 0-5.5 7.75-.5 8.13s79.38.38 82.88 0 5.25-7.5-.37-7.87-75.51-.26-82.01-.26z' fill='#191919'/><path d='m83.5 190.38c-5.25 0-5.5 7.75-.5 8.13s43.38.38 46.88 0 5.25-7.5-.37-7.87-39.51-.26-46.01-.26z' fill='#191919'/></svg><span>Трейлеры</span>");
	      
		  
  			setTimeout(function(){
				$(".full-start__icons > .icon--book",Lampa.Activity.active().activity.render()).empty().append("<svg fill='none' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path d='M5 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 18V4Z' fill='#0fbcf9' class='fill-4a5568'></path></svg>");
				$(".full-start__icons > .icon--like",Lampa.Activity.active().activity.render()).empty().append("<svg viewBox='0 0 24 24' xml:space='preserve' xmlns='http://www.w3.org/2000/svg'><path d='M22.231 12.518c2.355-2.414 2.354-6.325 0-8.738a5.942 5.942 0 0 0-4.365-1.81c-2.206.038-5.844 3.029-5.844 3.029s-3.74-3.033-6-3.03A5.933 5.933 0 0 0 1.769 3.78c-2.354 2.413-2.355 6.324 0 8.738L12 23l10.231-10.482z' fill='#f53b57' class='fill-000000'></path></svg>");
				$(".full-start__icons > .icon--wath",Lampa.Activity.active().activity.render()).empty().append("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11z' fill='#3f5a75' class='fill-34495e'></path><path d='M12 1C5.373 1 0 6.373 0 13h2C2 7.477 6.477 3 12 3s10 4.477 10 10h2c0-6.627-5.373-12-12-12z' fill='#39546e' class='fill-2c3e50'></path><path d='M13 11v2h7a1 1 0 0 0 0-2h-7zM12 5c-.552 0-1 .4-1 1v5h2V6c0-.6-.448-1-1-1z' fill='#ecf0f1' class='fill-bdc3c7'></path><path fill='#f53b57' d='m6.017 17.305 4.95-4.95.707.707-4.95 4.95z' class='fill-c0392b'></path><path d='M12 10c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zm0 1c.552 0 1 .4 1 1 0 .5-.448 1-1 1s-1-.5-1-1c0-.6.448-1 1-1z' fill='#ecf0f1' class='fill-bdc3c7'></path><path d='M12 0C5.373 0 0 5.3 0 12c0 6.6 5.373 12 12 12s12-5.4 12-12c0-6.7-5.373-12-12-12zm0 2c5.523 0 10 4.4 10 10 0 5.5-4.477 10-10 10S2 17.5 2 12C2 6.4 6.477 2 12 2z' fill='#a5cfd9' class='fill-95a5a6'></path><path d='M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0z' fill='#39546e' class='fill-2c3e50'></path><path d='M13.73 11c.17.3.281.6.281 1 0 .3-.111.7-.281 1h1.093c.114-.4.188-.7.188-1 0-.4-.074-.7-.188-1H13.73z' fill='#a5cfd9' class='fill-95a5a6'></path></svg>");
			},10); 

	   }
    })
	

	
})();