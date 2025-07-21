FROM golang:alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN apk add --no-cache build-base curl zip

ARG TARGETARCH
RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v26.1/protoc-26.1-linux-${TARGETARCH}.zip \
  && unzip protoc-26.1-linux-${TARGETARCH}.zip -d /usr/local \
  && rm protoc-26.1-linux-${TARGETARCH}.zip


RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

RUN mkdir -p internal/protocol

RUN protoc -I=protocol --go_out=paths=source_relative:internal/protocol protocol/quizzy.proto
RUN CGO_ENABLED=1 go build -v ./cmd/quizzy/quizzy.go

FROM node:24-alpine AS web
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY ./website /app/website
COPY ./protocol /app/protocol
WORKDIR /app/website

FROM web AS web-build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build:proto
RUN pnpm run build 

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/quizzy ./
RUN mkdir ./website
COPY --from=web-build /app/website/build ./website/build

CMD ["./quizzy"]