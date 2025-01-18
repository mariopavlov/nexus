FROM golang:1.21-alpine

WORKDIR /migrations

RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.17.0

COPY . .

CMD ["migrate", "-path", ".", "-database",  "postgres://postgres:postgres@postgres:5432/nexus?sslmode=disable", "up"]
