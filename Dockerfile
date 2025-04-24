FROM denoland/deno:2.2.11
WORKDIR /app
COPY . .
CMD ["deno", "task", "start"]
