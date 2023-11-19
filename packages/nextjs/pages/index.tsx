import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount, useBalance, useNetwork, useSignMessage } from "wagmi";
import { useContractRead } from "wagmi";

let len = 0;

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/pages/index.tsx
            </code>
          </p>
          <PageBody></PageBody>
        </div>
      </div>
    </>
  );
};

function PageBody() {
  return (
    <>
      <p className="text-center text-lg">Here we are!</p>
      <WalletInfo></WalletInfo>
      <RandomWord></RandomWord>
    </>
  );
}
function WalletInfo() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  if (address)
    return (
      <div>
        <p>Your account address is {address}</p>
        <p>Connected to the network {chain?.name}</p>
        <WalletAction></WalletAction>
        <WalletBalance address={address as `0x${string}`}></WalletBalance>
        <TokenInfo address={address as `0x${string}`}></TokenInfo>
        <ApiData address={address as `0x${string}`}></ApiData>
        <Voting></Voting>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function WalletAction() {
  const [signatureMessage, setSignatureMessage] = useState("");
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage();
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing signatures</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label className="label">
            <span className="label-text">Enter the message to be signed:</span>
          </label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={signatureMessage}
            onChange={e => setSignatureMessage(e.target.value)}
          />
        </div>
        <button
          className="btn btn-active btn-neutral"
          disabled={isLoading}
          onClick={() =>
            signMessage({
              message: signatureMessage,
            })
          }
        >
          Sign message
        </button>
        {isSuccess && <div>Signature: {data}</div>}
        {isError && <div>Error signing message</div>}
      </div>
    </div>
  );
}
function WalletBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useBalance({
    address: params.address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing useBalance wagmi hook</h2>
        Balance: {data?.formatted} {data?.symbol}
      </div>
    </div>
  );
}

function TokenInfo(params: { address: `0x${string}` }) {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing useContractRead wagmi hook</h2>
        <TokenName address={params.address}></TokenName>
        <TokenBalance address={params.address}></TokenBalance>
      </div>
    </div>
  );
}

function TokenName(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: params.address,
    abi: [
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "name",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>Token name: {name}</div>;
}

function TokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: params.address,
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [params.address],
  });

  const balance = typeof data === "number" ? data : 0;

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return <div>Balance: {balance}</div>;
}

function ApiData(params: { address: `0x${string}` }) {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing API Coupling</h2>
        {/* <TokenAddressFromApi></TokenAddressFromApi>
        <p>post method</p> */}
        <TokenAddressFromApi></TokenAddressFromApi>
        <RequestTokens address={params.address}></RequestTokens>
        <SelfDelegate address={params.address}></SelfDelegate>
      </div>
    </div>
  );
}

function TokenAddressFromApi() {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/contract-address")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading token address from API...</p>;
  if (!data) return <p>No token address information</p>;

  return (
    <div>
      <p>Token address from API: {data.result}</p>
    </div>
  );
}

function RequestTokens(params: { address: string }) {
  const [data, setData] = useState<{ result: boolean }>();
  const [isLoading, setLoading] = useState(false);

  const body = { address: params.address, value: "1" };
  // const body = { address: "0xE30B0e8ee4c8BA5Ff81368f0A069DC04548dFCb3", value: "1" };

  if (isLoading) return <p>Requesting tokens from API...</p>;
  if (!data)
    return (
      <button
        className="btn btn-active btn-neutral"
        onClick={() => {
          setLoading(true);
          fetch("http://localhost:3001/mint-tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
            .then(res => res.json())
            .then(data => {
              setData(data);
              setLoading(false);
            });
        }}
      >
        Request tokens
      </button>
    );

  return (
    <div>
      <p>Result from API: {data.result ? "worked" : "failed"}</p>
    </div>
  );
}

function SelfDelegate(params: { address: string }) {
  const [data, setData] = useState<{ result: boolean }>();
  const [isLoading, setLoading] = useState(false);

  const body = { address: params.address };

  if (isLoading) return <p>Self-Delegation from API...</p>;
  if (!data)
    return (
      <button
        className="btn btn-active btn-neutral"
        onClick={() => {
          setLoading(true);
          fetch("http://localhost:3001/self-delegate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
            .then(res => res.json())
            .then(data => {
              setData(data);
              setLoading(false);
            });
        }}
      >
        Self-Delegate Voting Power
      </button>
    );

  return (
    <div>
      <p>Self-Delegation result from API: {data.result ? "worked" : "failed"}</p>
    </div>
  );
}

function Voting() {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Voting</h2>
        <Proposals></Proposals>
        <br></br>
        <Vote></Vote>
      </div>
    </div>
  );
}

function Proposals() {
  const [data, setData] = useState<{ result: string[] }>();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/get-proposals")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return;
  <p>Loading proposals...</p>;

  if (!data) return <p>No proposals information</p>;

  len = data.result.length - 1;

  return (
    <div className="flex items-center flex-col flex-grow">
      <h2 className="card-title">Proposals</h2>
      <ul>
        {data.result.map((proposal, index) => (
          <li key={index}>{proposal}</li>
        ))}
      </ul>
    </div>
  );
}

function Vote() {
  const [votingProposalIndex, setVotingProposalIndex] = useState("");
  const [votingAmount, setVotingAmount] = useState("");
  const [data, setData] = useState<{ result: boolean }>();
  const [isLoading, setLoading] = useState(false);

  if (!data)
    return (
      <div className="flex items-center flex-col flex-grow">
        <h2 className="card-title">Vote</h2>
        <div className="form-control w-full max-w-xs my-4">
          <input
            type="number"
            min="0"
            max={len}
            placeholder="Type here the chosen porposal index"
            className="input input-bordered w-full max-w-xs"
            value={votingProposalIndex}
            onChange={e => setVotingProposalIndex(e.target.value)}
          />
          <br></br>
          <input
            type="number"
            placeholder="Type here the amount of token to vote"
            className="input input-bordered w-full max-w-xs"
            value={votingAmount}
            onChange={e => setVotingAmount(e.target.value)}
          />
        </div>
        <button
          className="btn btn-active btn-neutral"
          disabled={isLoading}
          onClick={() => {
            setLoading(true);
            fetch("http://localhost:3001/vote", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ proposalNumber: votingProposalIndex, amount: votingAmount }),
            })
              .then(res => res.json())
              .then(data => {
                console.log(`body: ${{ proposalNumber: votingProposalIndex, amount: votingAmount }}`);
                setData(data);
                setLoading(false);
              });
          }}
        >
          Vote
        </button>
      </div>
    );

  return (
    <div>
      <p>Result from API: {data.result ? "worked" : "failed"}</p>
    </div>
  );
}

function RandomWord() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://randomuser.me/api/")
      .then(res => res.json())
      .then(data => {
        setData(data.results[0]);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No profile data</p>;

  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing useState and useEffect from React library</h2>
        <h1>
          Name: {data.name.title} {data.name.first} {data.name.last}
        </h1>
        <p>Email: {data.email}</p>
      </div>
    </div>
  );
}

export default Home;
