# Build and install latest vmtest/main in build stage.
# Having a separate build stage will help make a slimmer image.
FROM rust:latest as builder
RUN cargo install vmtest
ADD . /vmtest-action
WORKDIR /vmtest-action
RUN cargo install --path .

FROM rust:slim
COPY --from=builder /usr/local/cargo/bin/vmtest /usr/local/bin/vmtest
COPY --from=builder /usr/local/cargo/bin/vmtest-action /usr/local/bin/vmtest-action
# Install vmtest runtime deps
RUN apt-get update && apt-get install -y \
  qemu-system-x86-64 \
  ovmf

ENTRYPOINT ["vmtest-action"]
