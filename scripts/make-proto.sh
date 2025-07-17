mkdir -p internal/protocol; protoc -I=protocol --go_out=paths=source_relative:internal/protocol protocol/quizzy.proto

cd website; pnpm build:proto; cd ..