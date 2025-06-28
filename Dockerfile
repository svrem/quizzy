FROM golang:alpine AS build

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -v -o /usr/local/bin ./...

FROM alpine:latest
COPY --from=build /usr/local/bin/quizzy /usr/local/bin/quizzy

CMD ["/usr/local/bin/quizzy"]