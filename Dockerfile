FROM golang:alpine AS build

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -v -o /usr/local/bin ./...

FROM node:24-alpine AS web
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY ./website /app
WORKDIR /app

FROM web AS web-build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM web
COPY --from=web-build /app/build /app/build

FROM alpine:latest

WORKDIR /app

COPY --from=build /usr/local/bin/quizzy ./
RUN mkdir ./website
COPY --from=web-build /app/build ./website/build

CMD ["./quizzy"]