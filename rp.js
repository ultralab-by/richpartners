var RichPartners = (function() {

    const USERINFO_ENDPOINT = "https://rtb.pushdom.co/users/info?callback=userinfo_rp";
    const ENDPOINT = "https://pushbank.pushdom.co/subscriptions/web";
	const FIREBASEJS = "https://www.gstatic.com/firebasejs/5.5.3/firebase.js";
	
	var pubInfo = {};

	var config = {
		apiKey: "AIzaSyBzLNmPHNw0wqKU0Z2Cx6qLRPq6KP6mSzQ",
		authDomain: "pushbank-b2893.firebaseapp.com",
		databaseURL: "https://pushbank-b2893.firebaseio.com",
		projectId: "pushbank-b2893",
		storageBucket: "pushbank-b2893.appspot.com",
		messagingSenderId: "513999950945"
	};

	var protocol = location.protocol === 'https:' ? 'https' : 'http';
	var url = encodeURIComponent(location.href);

	var JavaScript = {
		load: function(src, callback) {
			var script = document.createElement('script'),
				loaded;
			script.setAttribute('src', src);
			if (callback) {
				script.onreadystatechange = script.onload = function() {
					if (!loaded) {
						callback();
					}
					loaded = true;
				};
			}
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	};

	var getUrlVars = function() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
			vars[key] = value;
		});
		return vars;
	}

	function setCookie(name,value,days) {
	    var expires = "";
	    if (days) {
	        var date = new Date();
	        date.setTime(date.getTime() + (days*24*60*60*1000));
	        expires = "; expires=" + date.toUTCString();
	    }
	    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
	}
	
	function getCookie(name) {
	    var nameEQ = name + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0;i < ca.length;i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1,c.length);
	        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	    }
	    return null;
	}
	function eraseCookie(name) {   
	    document.cookie = name+'=; Max-Age=-99999999;';  
	}

	var logPostback = function(url) {
		if (url) {
			url = decodeURIComponent(url);
			var el = document.createElement("img");
			el.setAttribute("style", "width:0px; height:0px;");
			el.src = url;
			document.body.appendChild(el);
		}
	}

	var logInitSubscription = function(pubid, siteid) {
		if (pubid && siteid) {
			var el = document.createElement("img");
			el.setAttribute("style", "width:0px; height:0px;");
			el.src = "https://rtb.pushdom.co/pixels/storage/custom/pixel.gif?datasource=adx_reports&publisher_id=" + pubid + "&site_id=" + siteid + "&initialized_uniques=1&ssp_id=1447&traffic_channel=XML_PUSH&custom_1="+protocol+"&custom_2=1&custom_3="+url;
			document.body.appendChild(el);
		}
	}
	
	var logHit = function(pubid, siteid) {
		if (pubid && siteid) {
			var el = document.createElement("img");
			el.setAttribute("style", "width:0px; height:0px;");
			el.src = "https://rtb.pushdom.co/pixels/storage/custom/pixel.gif?datasource=adx_reports&publisher_id=" + pubid + "&site_id=" + siteid + "&hits=1&ssp_id=1447&traffic_channel=XML_PUSH&custom_1="+protocol+"&custom_2=1&custom_3="+url;
			document.head.appendChild(el);
		}
	}

	var getUserInfo = function() {
		var script = document.createElement("script");
		script.src = USERINFO_ENDPOINT;
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	
	window.userinfo_rp = function(data) {
		var country = data.country;
		var ip = data.ip;
		var user_agent = btoa(navigator.userAgent);
		var language = navigator.language || navigator.userLanguage;
		var uid = data.id;
		var local_time_zone = new Date().getTimezoneOffset().toString();
		var domain = window.location.hostname;

		//logHit(pubInfo.pubid, pubInfo.siteid);

		JavaScript.load(FIREBASEJS, function() {

			firebase.initializeApp(config);
			const messaging = firebase.messaging();

			if (window.Notification.permission == "default") {
				logInitSubscription(pubInfo.pubid, pubInfo.siteid);
			}

			messaging.requestPermission().then(function() {
				messaging.getToken().then(function(currentToken) {
					if (currentToken) {
						var xhr = new XMLHttpRequest();
						xhr.open("POST", ENDPOINT, true);

                        xhr.onreadystatechange = function() {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                            	setCookie('rp_subscription','1',3);
                            }
                        };

						var data = JSON.stringify({
							"uid": uid,
							"country": country,
							"ip": ip,
							"user_agent": user_agent,
							"language": language,
							"pub_id": pubInfo.pubid,
							"site_id": pubInfo.siteid,
							"iab_category": pubInfo.niche,
							"token": currentToken,
							"local_time_zone": local_time_zone,
							"domain": domain
						});
						xhr.send(data);

					} else {
						console.log("Token error");
					}
				});
			}).catch(function(err) {
				console.log(err);
			});

		});
	}

	return {
		init: function(data) {
			pubInfo = data;
			logHit(pubInfo.pubid, pubInfo.siteid);

			if (!getCookie('rp_subscription')) {
				getUserInfo();
			}
		}
	};

})();
