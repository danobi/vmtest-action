use clap::Parser;

#[derive(Parser)]
struct Args {
    name: String,
}

fn main() {
    let args = Args::parse();
    println!("hello {}", args.name);
}
