import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const lotteryAddress =
        chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFeeContract, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    const dispatch = useNotification()

    const {
        runContractFunction: enterLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        //runCOntract can send transactions and read state
        abi: abi, //
        contractAddress: lotteryAddress, //especificar networkid
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFeeContract,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress, // specify the networkId
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress, // specify the networkId
        functionName: "getWinner",
        params: {},
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        setEntranceFee(entranceFeeFromCall)
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        setNumPlayers(numPlayersFromCall)
    }

    const handleSuccess = async (tx) => {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleEventWinner = () => {
        if (lotteryAddress) {
            const provider = new ethers.providers.JsonRpcBatchProvider(
                "http://127.0.0.1:8545"
                //aqui va el servidor rpc de la blockchain a la que nos vamos a conectar
                //para obtener datos y desplegar contratos
            )
            const contract = new ethers.Contract(lotteryAddress, abi, provider)
            contract.on("WinnerPicked", async () => {
                const recentWinnerFromCall = await getWinner()
                setRecentWinner(recentWinnerFromCall)
                const numPlayersFromCall = (
                    await getNumberOfPlayers()
                ).toString()
                setNumPlayers(numPlayersFromCall)
            })
        }
    }

    useEffect(() => {
        handleEventWinner()
    })

    return (
        <div>
            {lotteryAddress ? (
                <div className="p-5">
                    <h3 className="font-semibold p-4">Enter Lottery</h3>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white p-3 rounded font-bold"
                        onClick={async () => {
                            await enterLottery({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>

                    <p>
                        Entrance fee:{" "}
                        {ethers.utils.formatUnits(entranceFeeContract, "ether")}{" "}
                        ETH
                    </p>
                    <p>Players: {numPlayers}</p>
                    <p>Recent Winner: {recentWinner}</p>
                </div>
            ) : (
                <p>No lottery address detected</p>
            )}
        </div>
    )
}

export default LotteryEntrance
