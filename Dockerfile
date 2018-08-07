FROM node:6-alpine
EXPOSE 11501
VOLUME ["/app/ssl"]
WORKDIR /app
COPY ./ ./
RUN yarn install
CMD ["node", "."]
