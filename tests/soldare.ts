import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Soldare } from "../target/types/soldare";

describe("soldare", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Soldare as Program<Soldare>;

  it("Is initialized!", async () => {
    // Add your test here.
  });
});
