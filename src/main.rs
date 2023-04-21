use clap::Parser;

#[derive(Parser, Debug)]
struct Args {
    name: String,
    image: String,
    uefi: bool,
    kernel: String,
    kernel_args: String,
    command: String,
}

fn main() {
    let args = Args::parse();
    println!("{:?}", args);
}
