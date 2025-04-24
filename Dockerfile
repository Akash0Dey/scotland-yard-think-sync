FROM denoland/deno:2.2.11
COPY . .
CMD ["deno", "task", "start"]
