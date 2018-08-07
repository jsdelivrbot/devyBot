FROM node:6-alpine
EXPOSE 443
EXPOSE 11500
VOLUME ["/app/ssl"]
WORKDIR /app
COPY ./ ./
RUN yarn install
CMD ["node", "."]
