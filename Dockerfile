ARG NODE_VERSION=20.11.1
ARG PNPM_VERSION=8.15.1

# builder
FROM node:${NODE_VERSION} as builder

RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app

COPY . .

RUN pnpm install && pnpm tsc

# CMD "/bin/sh" "-c" "pwd && ls -al"

# fianl stage
FROM node:${NODE_VERSION}-alpine as final

ENV NODE_ENV production
# ENV PORT=8080
# ENV JWT_SECRET=0d0bcd26060268f20ebf932c8563e54c

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/prisma/ ./prisma
# COPY ./.env .

RUN npm install -g pnpm@8.15.1 && pnpm install --frozen-lockfile

EXPOSE 8080

CMD ["node", "dist/index.js"]
