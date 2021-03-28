Query Account

```bash
$ gaiacli query account cosmos1dkdwcq64mxzrvujxdsjzcxg6eh6thpsy58ny4a --chain-id=gaia-13006
$ gaiacli query account cosmos1yqe9pthjnwud226qvhsd8z3f3krpn0kdvr2f38 --chain-id=gaia-13006

$ gaiacli query account cosmos1c0nsetrn3pfgz8ejq0kpvh97j8lt4vxzypqjz3 --chain-id=cosmoshub-2
$ gaiacli query account cosmos1443llf036t7rck5zuzakwyettey6njntsskvu6 --chain-id=cosmoshub-2
```


Delegate ( in terminal directly signed )

```bash
$ gaiacli tx staking delegate cosmosvaloper1le34teftd4fa5lu64uyafzmw78yq7dgcnxchp3 1000muon --from tony --chain-id gaia-13006 --gas auto --gas-adjustment 1.1 --fees 2000muon
```

Delegate ( offsite unsigned )

```bash
$ gaiacli tx staking delegate cosmosvaloper1le34teftd4fa5lu64uyafzmw78yq7dgcnxchp3 1000muon --from `gaiacli keys show --address tony` --chain-id gaia-13006 --gas 200000 --gas-adjustment 1.1 --fees 2000muon --memo=tony-send --generate-only > simple1.json
```

Send ( offsite unsigned )

```bash
$ gaiacli tx send cosmos1dkdwcq64mxzrvujxdsjzcxg6eh6thpsy58ny4a cosmos1yqe9pthjnwud226qvhsd8z3f3krpn0kdvr2f38 1000muon  --chain-id gaia-13006 --gas 200000 --gas-adjustment 1.1 --fees 2000muon --memo=tony-send --generate-only > send.json
```


Withdraw

```bash
$ gaiacli tx distribution withdraw-all-rewards --from `gaiacli keys show --address tony` --chain-id gaia-13006 --gas 200000 --gas-adjustment 1.1 --fees 2000muon --memo=tony-send
```


Check delegation

```bash
$ gaiacli query staking delegations cosmos1dkdwcq64mxzrvujxdsjzcxg6eh6thpsy58ny4a --chain-id gaia-13006
$ gaiacli query staking delegations cosmos1c0nsetrn3pfgz8ejq0kpvh97j8lt4vxzypqjz3 --chain-id cosmoshub-2
```


Check delegation rewards

```bash
$ gaiacli query distribution rewards cosmos1dkdwcq64mxzrvujxdsjzcxg6eh6thpsy58ny4a --chain-id gaia-13006
$ gaiacli query distr rewards cosmos1c0nsetrn3pfgz8ejq0kpvh97j8lt4vxzypqjz3 --chain-id cosmoshub-2
```

Undelegate

```bash
$ gaiacli tx staking unbond cosmosvaloper1le34teftd4fa5lu64uyafzmw78yq7dgcnxchp3 500muon --from `gaiacli keys show --address tony` --chain-id gaia-13006 --gas 200000 --gas-adjustment 1.1 --fees 2000muon --memo=tony-send
```



Sign offline

```bash
$ gaiacli tx sign --offline --account-number=118541 --sequence=0 --chain-id=gaia-13006 simple1.json --from=tony >signedTX.json
$ gaiacli tx sign --offline --account-number=118541 --sequence=1 --chain-id=gaia-13006 send.json --from=tony >signedsendTX.json
```


Broadcast

```bash
$ gaiacli tx broadcast ./signedTX.json
```
