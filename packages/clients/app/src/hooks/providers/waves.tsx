import { useAccount } from "wagmi";
import { UseQueryExecute, gql, useQuery } from "urql";
import { createContext, useContext } from "react";

export interface WavesDataProps {
  synths: SynthUI[];
  synthNfts?: SynthNFT[];
  waveNftMap: Map<string, WaveNFT>; // wave contract => synth nft
  waveTokenMap: Map<string, Wave>; // wave contract => wave data
  waveSynthMap: Map<string, string[]>; // synth contract => wave contracts
  fetchSynths: UseQueryExecute;
  fetchSynthNfts: UseQueryExecute;
  fetchWaveNfts: UseQueryExecute;
}

type Props = {
  children: React.ReactNode;
};

const WavesContext = createContext<WavesDataProps | null>(null);

const SynthNFTsQuery = gql`
  query {
    synthNFTs {
      id
      nftOwnershipRequired
      artist
      organizer
      name
      blockNumber
      blockTimestamp
      transactionHash

      # nftWhitelist
      waveNFTs {
        waveNft {
          id
          startTime
          duration
          artist
          creative
          name
          data
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    }
  }
`;

const WaveNFTsQuery = gql`
  query {
    waveNFTs {
      id
      startTime
      duration
      artiist
      creative
      name
      data
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// query ($address: String!) {
//   synths(address: $address) {

const SynthsQuery = gql`
  query {
    synths {
      id
      owner
      contract
      tokenId
      blockNumber
      blockTimestamp
      transactionHash

      waves {
        wave {
          id
          owner
          contract
          tokenId
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    }
  }
`;

export const WavesProvider = ({ children }: Props) => {
  const currentValue = useContext(WavesContext);

  if (currentValue) throw new Error("WavesProvider can only be used once");

  const { address } = useAccount();

  const [nfts, fetchSynthNfts] = useQuery<{ synthNFTs: SynthNFT[] }>({
    query: SynthNFTsQuery,
  });
  const [waveNfts, fetchWaveNfts] = useQuery<{ waveNFTs: WaveNFT[] }>({
    query: WaveNFTsQuery,
  });
  const [tokens, fetchSynths] = useQuery<{ synths: Synth[] }>({
    query: SynthsQuery,
    // variables: { from, limit },
  });

  const waveTokenMap: Map<string, Wave> = new Map(); // wave contract => wave data
  const waveNftMap: Map<string, WaveNFT> = new Map(); // wave contract => wave nft
  const waveSynthMap: Map<string, string[]> = new Map(); // synth contract => wave contracts
  const synthTokenMap: Map<string, Synth> | undefined =
    tokens.data?.synths && tokens.data.synths.length > 0
      ? tokens.data.synths
          ?.filter(
            (token) => token.owner?.toLowerCase() === address?.toLowerCase(),
          )
          .reduce((acc, token) => {
            if (token.contract) {
              acc.set(token.contract, token);

              if (token.waves) {
                token.waves?.forEach(({ wave }) => {
                  wave.contract && waveTokenMap.set(wave.contract, wave);
                });

                waveSynthMap.set(token.contract, [
                  ...token.waves.map(({ wave }) => wave.contract ?? ""),
                ]);
              }
            }

            return acc;
          }, new Map<string, Synth>())
      : undefined;

  waveNfts.data &&
    waveNfts.data.waveNFTs.length > 0 &&
    waveNfts.data.waveNFTs.forEach((nft) => {
      waveNftMap.set(nft.id, nft);
    });

  const synths: SynthUI[] =
    nfts.data?.synthNFTs && nfts.data?.synthNFTs.length > 0
      ? nfts.data?.synthNFTs.reduce<SynthUI[]>((acc, nft) => {
          const synth = synthTokenMap && synthTokenMap.get(nft.id);

          const synthUI: SynthUI = {
            ...nft,
          };

          if (synth) {
            const inactiveWaves: WaveUI[] =
              synth.waves
                ?.filter(({ wave }) =>
                  nft.waveNFTs?.find((nft) => nft.waveNft.id === wave.contract),
                )
                .map(({ wave }) => {
                  const nft = wave.contract && waveNftMap.get(wave.contract);
                  if (nft) {
                    return {
                      ...nft,
                      ...wave,
                    };
                  }

                  return {
                    ...wave,
                    id: wave.contract ?? "",
                    name: "Unknown",
                    artist: "Unknown",
                    creative: "Unknown",
                    data: "",
                  };
                }) ?? [];

            synthUI.waves =
              nft.waveNFTs
                ?.map(({ waveNft }) => {
                  const wave = waveTokenMap.get(waveNft.id);
                  if (wave) {
                    return {
                      ...wave,
                      ...waveNft,
                    };
                  }

                  return {
                    ...waveNft,
                  };
                })
                .concat(inactiveWaves) ?? [];
            synthUI.owner = synth.owner;
            synthUI.account = synth.id;
            synthUI.tokenId = synth.tokenId;

            return [...acc, synthUI];
          }

          synthUI.waves = nft.waveNFTs?.map((wave) => wave.waveNft) ?? [];

          return acc;
        }, [])
      : [];

  return (
    <WavesContext.Provider
      value={{
        synths,
        synthNfts: nfts.data?.synthNFTs ?? [],
        waveNftMap,
        waveTokenMap,
        waveSynthMap,
        fetchSynths,
        fetchSynthNfts,
        fetchWaveNfts,
      }}
    >
      {children}
    </WavesContext.Provider>
  );
};

export const useWaves = () => {
  const value = useContext(WavesContext);
  if (!value) throw new Error("Must be used within a WavesProvider");
  return value;
};
