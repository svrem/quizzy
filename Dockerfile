FROM golang:alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN apk add --no-cache build-base

RUN CGO_ENABLED=1 go build -v ./cmd/quizzy/quizzy.go

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

COPY --from=build /app/quizzy ./
RUN mkdir ./website
COPY --from=web-build /app/build ./website/build

CMD ["./quizzy"]