FROM node:alpine3.19
WORKDIR /app
COPY . .
RUN yarn --ignore-engines
ENV PORT=5000
EXPOSE ${PORT}
EXPOSE 3001

CMD [ "yarn", "start" ]