FROM node:10 AS ui-build
WORKDIR /usr/src/app
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

FROM node:10 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/frontend/dist ./frontend/dist
COPY api/package*.json ./api/
RUN cd api && npm install
COPY api/app.js ./api/

EXPOSE 4000

CMD ["node", "./api/app.js"]