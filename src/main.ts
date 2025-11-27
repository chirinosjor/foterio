import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { router } from './routes/router';

import { supabase } from "./lib/supabase";

supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);
  console.log("Session:", session);
});


const app = createApp(App);
app.use(router);
app.mount('#app');