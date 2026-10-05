"""
Dice game helpers.

The dice game reuses the existing SpinGame contract: the player pays for a
spin() transaction and the contract's on-chain result (1-8, from the `Spun`
event) is the randomness source. Because a die has 6 faces (and 8 is not
divisible by 6), mapping `result % 6` directly would favour faces 1 and 2.
To keep every face at exactly 1/6 we hash the transaction hash together with
the on-chain result and take the digest modulo 6. The frontend runs the exact
same function, so the animation always lands on the same face the backend
records.
"""
import hashlib

DICE_FACES = 6

# Points awarded per face (1-6).
DICE_POINTS = {1: 5, 2: 10, 3: 15, 4: 20, 5: 30, 6: 50}


def derive_dice_value(tx_hash: str, spin_result: int) -> int:
    seed = f"{tx_hash.lower()}:{int(spin_result)}".encode()
    digest = int.from_bytes(hashlib.sha256(seed).digest(), 'big')
    return (digest % DICE_FACES) + 1
