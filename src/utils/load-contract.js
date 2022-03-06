import contract from "@truffle/contract"

const loadContract = async (contractName, provider) => {
    const res = await fetch(`/contracts/${contractName}.json`)
    const Artifact = await res.json()

    const _contract = contract(Artifact)

    
    _contract.setProvider(provider)

    let deployedContract = null
    
    try {
        deployedContract = await _contract.deployed()
    } catch {
        console.error("You are connected to the wrong network")
    }

    return deployedContract

}


export default loadContract