use anyhow::{anyhow, Result};
use clap::Parser;

#[derive(Parser, Debug)]
struct Args {
    name: String,
    image: String,
    // The clap directives are to parse "true"/"false" as bools while
    // also working around the fact that by default clap treats bools
    // as flags and not positional parameters.
    #[clap(action = clap::ArgAction::Set, value_parser = parse_bool)]
    uefi: bool,
    kernel: String,
    kernel_args: String,
    command: String,
}

fn parse_bool(s: &str) -> Result<bool> {
    match s.to_lowercase().as_ref() {
        "true" => Ok(true),
        "false" => Ok(false),
        _ => Err(anyhow!("Invalid boolean value")),
    }
}

fn main() {
    let args = Args::parse();
    println!("{:?}", args);
}
