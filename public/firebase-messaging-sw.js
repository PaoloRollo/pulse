importScripts(
  "https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyCMbyxOTIpf6DMKTesskrXOr5IHFsJCkvE",
  authDomain: "pulse-social-5aff6.firebaseapp.com",
  projectId: "pulse-social-5aff6",
  storageBucket: "pulse-social-5aff6.appspot.com",
  messagingSenderId: "648535313082",
  appId: "1:648535313082:web:c05ed6e72fcbd05dd65083",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(messaging, (data) => {
  handleMessage(data);
});

messaging.onMessage(messaging, (data) => {
  handleMessage(data);
});

const handleMessage = (data) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
};
