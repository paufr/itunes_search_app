import Vue from 'vue';
import VueRouter from 'vue-router';
import Artists from '../views/Artists.vue';
import Albums from '../views/Albums.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/artists',
  },
  {
    path: '/artists',
    name: 'Artists',
    component: Artists,
  },
  {
    path: '/artists/:artistId/albums',
    name: 'Albums',
    component: Albums,
    props: true,
    beforeEnter(to, from, next) {
      const isValidId = Number.isInteger(Number(to.params.artistId));
      next(isValidId);
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
