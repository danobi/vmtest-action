# Build and install latest vmtest in build stage.
# Having a separate build stage will help make a slimmer image.
FROM rust:latest as builder
RUN cargo install vmtest

FROM rust:slim
COPY --from=builder /usr/local/cargo/bin/vmtest /usr/local/bin/vmtest
# Install vmtest runtime deps
RUN apt-get update && apt-get install -y \
  qemu-system-x86-64 \
  ovmf

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
