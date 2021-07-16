let RichPartners = (function () {

  const USERINFO_ENDPOINT = "https://rtb.pushdom.co/users/info?callback=userinfo_rp";
  const ENDPOINT = "https://pushbank.pushdom.co/subscriptions/web";
  const FIREBASE_APP_JS = "https://www.gstatic.com/firebasejs/5.5.3/firebase-app.js";
  const FIREBASE_MESSAGING_JS = "https://www.gstatic.com/firebasejs/5.5.3/firebase-messaging.js";

  let pubInfo = {};

  let config = {
    apiKey: "AIzaSyBzLNmPHNw0wqKU0Z2Cx6qLRPq6KP6mSzQ",
    authDomain: "pushbank-b2893.firebaseapp.com",
    databaseURL: "https://pushbank-b2893.firebaseio.com",
    projectId: "pushbank-b2893",
    storageBucket: "pushbank-b2893.appspot.com",
    messagingSenderId: "513999950945"
  };

  let protocol = location.protocol === 'https:' ? 'https' : 'http';
  let url = encodeURIComponent(location.href);

  function loadJs(src) {
    return new Promise(function (resolve, reject) {
      let script = document.createElement('script');
      script.src = src;
      script.onload = function () {
        resolve(src);
      };
      script.onerror = function () {
        reject(src);
      };
      document.getElementsByTagName('body')[0].appendChild(script);
    });
  }

  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) == 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  let logInitSubscription = function (pubid, siteid) {
    if (pubid && siteid) {
      let el = document.createElement("img");
      el.setAttribute("style", "width:0px; height:0px;");
      el.src = "https://rtb.pushdom.co/pixels/storage/custom/pixel.gif?datasource=adx_reports&publisher_id="
          + pubid + "&site_id=" + siteid
          + "&initialized_uniques=1&ssp_id=1447&traffic_channel=XML_PUSH&script_type=content-locker&custom_1="
          + protocol + "&custom_2=1&custom_3=" + url;
      document.getElementsByTagName('body')[0].appendChild(el);
    }
  }

  let logHit = function (pubid, siteid) {
    if (pubid && siteid) {
      let el = document.createElement("img");
      el.setAttribute("style", "width:0px; height:0px;");
      el.src = "https://rtb.pushdom.co/pixels/storage/custom/pixel.gif?datasource=adx_reports&publisher_id="
          + pubid + "&site_id=" + siteid
          + "&hits=1&ssp_id=1447&traffic_channel=XML_PUSH&script_type=content-locker&custom_1=" + protocol
          + "&custom_2=1&custom_3=" + url;
      document.head.appendChild(el);
    }
  }

  let getUserInfo = function () {
    let script = document.createElement("script");
    script.src = USERINFO_ENDPOINT;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  if (window.Notification.permission == "default") {
    window.onload = function() {
      let contentLocker = document.createElement("div");
      contentLocker.setAttribute('id', "content-locker")
      contentLocker.style.position = "fixed";
      contentLocker.style.top = "0";
      contentLocker.style.left = "0";
      contentLocker.style.width = "100%";
      contentLocker.style.height = "100%";
      contentLocker.style.zIndex = "99999";
      contentLocker.style.background = "rgba(30, 30, 30, 0.5)";
      contentLocker.style.opacity = 0.2;
      document.body.appendChild(contentLocker);
    }
  }
  

  window.Notification.requestPermission().then(function(result) {
      document.getElementById("content-locker").remove();
  });

  window.userinfo_rp = function (data) {
    let country = data.country;
    let ip = data.ip;
    let user_agent = btoa(navigator.userAgent);
    let language = navigator.language || navigator.userLanguage;
    let uid = data.id;
    let local_time_zone = new Date().getTimezoneOffset().toString();
    let domain = window.location.hostname;

    loadJs(FIREBASE_APP_JS)
      .then(() => loadJs(FIREBASE_MESSAGING_JS))
      .then(() => {
        firebase.initializeApp(config);
        const messaging = firebase.messaging();

        if (window.Notification.permission == "default") {
          logInitSubscription(pubInfo.pubid, pubInfo.siteid);
        }

        messaging.requestPermission()
          .then(() => {
            messaging.getToken()
              .then(currentToken => {
                if (currentToken) {
                  let xhr = new XMLHttpRequest();
                  xhr.open("POST", ENDPOINT, true);

                  xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                      setCookie('rp_subscription', '1', 3);
                    }
                  };

                  let data = JSON.stringify({
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
          })
          .catch(console.log);
      });
  }

  return {
    init: function (data) {
      pubInfo = data;
      logHit(pubInfo.pubid, pubInfo.siteid);

      if (!getCookie('rp_subscription')) {
        getUserInfo();
      }
    }
  };
})();
