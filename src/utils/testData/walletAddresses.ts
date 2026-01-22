import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export type WalletAddressEntry = {
  chain: 'ethereum' | 'base';
  entries: {
    address: string;
    used: boolean;
  }[];
};

// Known bot/exchange wallet addresses that should trigger error modal during agent creation
export const botWalletAddresses = {
  ethereum: [
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8', // Binance Cold Wallet - known exchange wallet
  ],
} as const;

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to persist used wallet addresses across test runs
const USED_ADDRESSES_FILE = path.join(__dirname, 'usedWalletAddresses.json');

/**
 * Load used addresses from persistent storage
 */
function loadUsedAddresses(): Set<string> {
  try {
    if (fs.existsSync(USED_ADDRESSES_FILE)) {
      const data = fs.readFileSync(USED_ADDRESSES_FILE, 'utf-8');
      return new Set(JSON.parse(data));
    }
  } catch {
    // If file doesn't exist or is corrupted, start fresh
  }
  return new Set();
}

/**
 * Save used addresses to persistent storage
 */
function saveUsedAddresses(usedAddresses: Set<string>): void {
  try {
    fs.writeFileSync(USED_ADDRESSES_FILE, JSON.stringify([...usedAddresses], null, 2));
  } catch {
    // Silently fail if we can't write - tests will still work
  }
}

/**
 * Get a random unused wallet address from any chain
 * Marks the address as used and persists the state
 */
export function getRandomUnusedWalletAddress(): { chain: 'ethereum' | 'base'; address: string } {
  const usedAddresses = loadUsedAddresses();

  // Collect all unused addresses from all chains
  const allUnused: { chain: 'ethereum' | 'base'; address: string }[] = [];

  for (const chainEntry of walletAddressEntries) {
    for (const entry of chainEntry.entries) {
      if (!usedAddresses.has(entry.address.toLowerCase())) {
        allUnused.push({ chain: chainEntry.chain, address: entry.address });
      }
    }
  }

  if (allUnused.length === 0) {
    throw new Error('No unused wallet addresses available. Consider resetting the used addresses file.');
  }

  // Select a random address
  const randomIndex = Math.floor(Math.random() * allUnused.length);
  const selected = allUnused[randomIndex];

  return selected;
}

/**
 * Mark a wallet address as used (call this after successful agent creation)
 */
export function markWalletAddressAsUsed(address: string): void {
  const usedAddresses = loadUsedAddresses();
  usedAddresses.add(address.toLowerCase());
  saveUsedAddresses(usedAddresses);
}

/**
 * Reset all used wallet addresses (useful for test cleanup)
 */
export function resetUsedWalletAddresses(): void {
  try {
    if (fs.existsSync(USED_ADDRESSES_FILE)) {
      fs.unlinkSync(USED_ADDRESSES_FILE);
    }
  } catch {
    // Silently fail
  }
}

/**
 * Get count of remaining unused addresses
 */
export function getUnusedAddressCount(): number {
  const usedAddresses = loadUsedAddresses();
  let count = 0;

  for (const chainEntry of walletAddressEntries) {
    for (const entry of chainEntry.entries) {
      if (!usedAddresses.has(entry.address.toLowerCase())) {
        count++;
      }
    }
  }

  return count;
}

export const walletAddressEntries: WalletAddressEntry[] = [
  {
    chain: 'ethereum',
    entries: [
      { address: '0xd772ff1b9530fb95c4fb3759f623128b5d2ad879', used: false },
      { address: '0x7077190a12b7bb40c0ded8d47b5d8cc599ada5c4', used: false },
      { address: '0xa841d6c4764771e50a7e4247429a2840fd04539b', used: false },
      { address: '0x43fa92289e934a5591bdecbe28c419494ea39d07', used: false },
      { address: '0x361652d911b8f2207721ce4b0dcd86d6e5179eb0', used: false },
      { address: '0x6e314220258a6fa41c2d50cd98f123ffff247d9e', used: false },
      { address: '0xa104ca3b307382977cf73da7f8391b0cb56c2228', used: false },
      { address: '0x28839a2d1fe136108883e644541f380ebb1f5ca1', used: false },
      { address: '0xc5d144feedb105794d6e9072c2a22a910df32c69', used: false },
      { address: '0x48c59a9c32f6111dc0efeb9e59915d741fde15af', used: false },
      { address: '0xd1fec7163e40eed9c6b8f4672d3b57315e99702b', used: false },
      { address: '0xa2185397cc81c0472a558e408080734166de20bf', used: false },
      { address: '0xa71ba733d2b206ef7378db09353cd043d16db402', used: false },
      { address: '0x6b7d0cc17fee1ac9531de30884b0d3ceaa07fd86', used: false },
      { address: '0x756b84eb85fcc1f4fcdcc2b08db6a86e135fbc25', used: false },
      { address: '0x458a6399f23fb34b98fd12fc855fea89feb2be11', used: false },
      { address: '0x4f812f09f4838a001b3ae4b8e7d1e2c4c43e5746', used: false },
      { address: '0x03736eb4aee4c0bbe7ead5f14a88e393f44da66c', used: false },
      { address: '0xcc2feb273dddab4d4ede72e06c82adfa61684846', used: false },
      { address: '0x9bcd04fcf5572ada0356197115f077e55dddd256', used: false },
      { address: '0xa6be165ce71dbef98c82a8442255ff60441f511c', used: false },
      { address: '0x3a958a49533bfdde9da7dd0eb61ea8b7c21449d3', used: false },
      { address: '0x1f865986a630f93206a30b74f07cc9f1519e22b9', used: false },
      { address: '0x737bac96569ffcc02e117390b1c242512306b57e', used: false },
      { address: '0x8b34b1903c0df1d749d26dca8db73153eb60f011', used: false },
      { address: '0x54b4429b182f0377be7e626939c5db6440f75d7a', used: false },
      { address: '0x0aaf2e5c563f88ad939224c857b5ce6fe55c7a5c', used: false },
      { address: '0x88623b92a02c2e713c6e8055d86f631fd69984b1', used: false },
      { address: '0x0f61d61ffdf741a87d506c55c2c5bd3f76d3b2b5', used: false },
      { address: '0x3973c37328b6d1273882b55c4008a3d501a62187', used: false },
      { address: '0xb96c0b082ffcefeeeedff8201f3a7e2df0f09e1d', used: false },
      { address: '0x63868d16a5b1acc069989a083721323ceccea685', used: false },
      { address: '0x0293aa15e48ce9d8d7dcf3ae00400fbec80be9f5', used: false },
      { address: '0x2466253b5ce786f105bc0b2d7a9a6d088afb0002', used: false },
      { address: '0xa19b5673d694d2d05f4b8f47fc83f1fb046dc5f6', used: false },
      { address: '0x444254655a48f0ff9df59e47878ce762569003a6', used: false },
      { address: '0x00e4c4b10aa4ed8c1810c85c6efff3d9a64f4dfb', used: false },
      { address: '0xd8f41f341afe2c411b21b3f96263c6584b69baeb', used: false },
      { address: '0x0525ed8e1dd463af2724bd5cc334461733745df5', used: false },
      { address: '0xdce373458b245bf899079a9cf8e3c10f24703f34', used: false },
      { address: '0x374cee5bdfc05b43725d2d8e4d22718cfd2c02cb', used: false },
      { address: '0x18b1b12b9f10f12c789fb34b1cab7de74a7753c6', used: false },
      { address: '0x5e70164bf6edd4b6a7d8b7cbd91cde411304bd37', used: false },
      { address: '0xfaf2d180629583ca8a60ae62e116804f1f5c5596', used: false },
      { address: '0x004cfb59553b5d5e78bad38ebbb506f44ed53992', used: false },
      { address: '0x53e74a3846f097a18e40868d2853ca19ef10f308', used: false },
      { address: '0x04d6c8d0ce010563211c1a98605428b5e979681e', used: false },
      { address: '0x8c6323a617129c14cc6ecdaec4d1ea0f4d5d4881', used: false },
      { address: '0x93a92f7372ce0b09fa23a1eb2a4155091fb4ca8f', used: false },
      { address: '0xc73b6bfe0820dd0946ce3e31c1369dfadfd9dd1a', used: false },
      { address: '0x275152121be48288807e736ef880643494cc73a6', used: false },
      { address: '0xc36739e1df51dbd37dd980b8b64b06ef267771b3', used: false },
      { address: '0xbf380d6d699e5fdf4ae19406af3edf422ffd9687', used: false },
      { address: '0x63a7f1ee924f5fbb97f52bc81623f7d7e970f72f', used: false },
      { address: '0xe2eb8dc6310726367f56d1abe7bb68e7839f8e30', used: false },
      { address: '0x673a0595bc1c0ed3025ad2db5ed868c28dc073d4', used: false },
      { address: '0xfb7b7d4be805d1ab31f5a791e657d52a243c4480', used: false },
      { address: '0xe97bc73920859e6098ece9300f294e0f0e34efe4', used: false },
      { address: '0x4001dc850226cdf767d1e062f5f90c26469dbea8', used: false },
      { address: '0x9d0b4ad0c4fa13b628747d2512cdf15c407419e2', used: false },
      { address: '0xf9b0d568e0701c578500d0d2efdef41478275155', used: false },
      { address: '0x418ec9fabdfae9e41218e76e225b2047cd8cc49e', used: false },
      { address: '0x5a76b2348ac43d9b8b45a6ebaf97df9d3ec9edab', used: false },
      { address: '0xab5e4865db29adfd8aa084a71d5b6a3441398895', used: false },
      { address: '0x416c86b72083d1f8907d84efd2d2d783dffa3efb', used: false },
      { address: '0x61e0f7a9cb8bf363e24ba72c1be0b9cae1f7d8c8', used: false },
      { address: '0x37b096bed3f562045400781f5ca50db04632abf4', used: false },
      { address: '0x7dad1b430b367b9b18032a5fa0920885f5e8a0ab', used: false },
      { address: '0xc0540f536b2e09adac1495770c2acee300d7ad8b', used: false },
      { address: '0x1b12e0df975f42e52e98b5273b9e4f1c1cf7ebb6', used: false },
      { address: '0x99facd854970a27c4c9e170c543d8b6dc368e4d0', used: false },
      { address: '0xe44065007c69fbd1cec3c9815e25b412443d7839', used: false },
      { address: '0xc175b231faf2d48798f0e55df537ac63733c4ae7', used: false },
      { address: '0x39f962b2868ba89a00bdae6054b06188ec391ef4', used: false },
      { address: '0x098210a783ba135b98b10d7f9937db17b9bb5707', used: false },
      { address: '0x6ded2b9d49b421a785fe602c6ba1e710cfdc4c2a', used: false },
      { address: '0xb6b9524b905318e2f50a48380a2d22714ca4262e', used: false },
      { address: '0xd0f5ebcc3818a38e8a5b7535a0078b076c19b307', used: false },
      { address: '0x218c689822b474fc07565a6ff5f147330cd48a1c', used: false },
      { address: '0x037a3ad45b2668436c54d63b92226d3e8dcc85ab', used: false },
      { address: '0x7b5cef4d95f3a708bf205bc016d0362895934048', used: false },
      { address: '0xcca3c17a5edb7de9fd89fb5553f5fb3125c1ca0c', used: false },
      { address: '0xaf91874d3ffe2fbfebb276dcd980263bff0d7c6d', used: false },
      { address: '0x0dd91eb8928c9bfce961cae6e511e701ce513f03', used: false },
      { address: '0xf95738d279c996329723d7d4f712c86634e2e065', used: false },
      { address: '0x5ba885be295a2f877a790d8fb7a8d57ad2d60510', used: false },
      { address: '0xc3ac93a05acce9468752fb44b25ccabc04d6bcad', used: false },
      { address: '0x2c59ea8c878a07df888870df693d9dacce62f7dc', used: false },
      { address: '0x39efb67edefdc397b77b9a9602c02c98fa78a233', used: false },
      { address: '0x28b20af77a1e9802a24db344258e9ba1964a51ae', used: false },
      { address: '0x5e9d031697f0955a228d3a5a186efefe4a3495b0', used: false },
      { address: '0x784618641a464d4b9496338a48d645533a60efca', used: false },
      { address: '0x4f612011921fd6d493a763c1a3f895f4cdf29b81', used: false },
      { address: '0x41f0360e24119162997cd539eb2d5aa7856be907', used: false },
      { address: '0x5fe8e936fb1fc9cc70d5c298ec6041a3c6e41de4', used: false },
      { address: '0x399436d85107d4d229eca3e56dd05d31cb8cb592', used: false },
      { address: '0xbfc5b693066091c31c85a768c9ff1fc80b7799cf', used: false },
      { address: '0xe6c6a2f1ea6ddae99a3ff92f626cc0c2c6c022c0', used: false },
      { address: '0x34684ef7f82ca93e0a740c12e765c2c75ae9fb2e', used: false },
      { address: '0xdc67641614d8b466cc94d88630ddd49f69046e26', used: false },
    ],
  },
  {
    chain: 'base',
    entries: [
      { address: '0x88f7667732c23847174cb2d135d0c4a546e70202', used: false },
      { address: '0x6e82335749761b4e134f0f44326e5e160b2e5c00', used: false },
      { address: '0x3c8ec95dfa17a4b479f943fc22525c1b34d4126a', used: false },
      { address: '0x13c634850b62c8c92697837131edf03728d5d664', used: false },
      { address: '0xc22826b44ea3fbb52ce0e9c76ea490c63987f870', used: false },
      { address: '0x083d1ff23e698d5926b35f552f9bed418b29de1b', used: false },
      { address: '0x1dd97e3349a8c687379c4ceb64e93084f74ab601', used: false },
      { address: '0x326bb4f6527b4f5a2a4bf357aba2d8db55a232f8', used: false },
      { address: '0xeaf194fb9301eb493394addc62111642e663c7d8', used: false },
      { address: '0xda3e34ab9d5e43bf1aff3641576215f63dac24e0', used: false },
      { address: '0x9066d3cf60d9f7b705026417e8e533b424bc3d48', used: false },
      { address: '0xd1ed468a9da3ed02f0c87928350a28666bdbdbcf', used: false },
      { address: '0x2c41d75d8323424f89d5a795527ccba52f25e2b8', used: false },
      { address: '0x25a697b94b94d6644370f413afca1fe682327537', used: false },
      { address: '0x6792ad36c9c47a430451059ff7377eea106480cc', used: false },
      { address: '0xf57f34b2dc75018a116b3715a3b67ef50136e1b7', used: false },
      { address: '0xdb3cbd99ead05ecf67850b1dfdd2e7c02620b68a', used: false },
      { address: '0x78280d5da6c4e064125d78823113718d18e2fbaf', used: false },
      { address: '0x19c59cf6e49912e644f2da222ae2645bc78264c7', used: false },
      { address: '0xe29d989a5e24fef1d27caa0259de8bc8c852dc21', used: false },
      { address: '0xcd4d614d18e08ccc555fa9cd025de80dccdc7aca', used: false },
      { address: '0xdd2a42f665dfe6ca862329926be586e2a9e7d7bc', used: false },
      { address: '0x6d602add6f1aa9a9714380ea9e4a44bf5da6374d', used: false },
      { address: '0x67a2aae772df035c558db2ceefd44ec8d2bc2ec2', used: false },
      { address: '0x7aaf69495b44dbd8db2fe846a84e4ad76f001a76', used: false },
      { address: '0x55b5fa81919861addfa9519dbe1966965217d340', used: false },
      { address: '0xa8c071036c818d733296e56db8dda0fd4f7e9631', used: false },
      { address: '0xf181070a9faedab3f69afc2d17384b349681a1be', used: false },
      { address: '0x8dbee8f3917049bc30fef01924a7ac79d16cf2b9', used: false },
      { address: '0xce208465e6958ef91d42d362c154f48b26b150cc', used: false },
      { address: '0x15ccf9e7c5c5be7f4b929bf2651768fe5692e12c', used: false },
      { address: '0xd3ba52018a8d16816d6848383939c6ad0b2cc0de', used: false },
      { address: '0x4c0221a0ab62c336a6f9e246e145bcdd37387e86', used: false },
      { address: '0xecc0feb80c1aba1b460738b7c9cf9d2b3acd86db', used: false },
      { address: '0x60b609575c14c623c59c4b0d88a118aa12b3a5c8', used: false },
      { address: '0xb04a9c637ffa77e5a38c5c2a6c579ca4dfb5aa0d', used: false },
      { address: '0xf470276b31b727a61ce251d926d6239ce9befc7f', used: false },
      { address: '0xe3169b75d3c4ce335e806e5b7e282f9289522f3a', used: false },
      { address: '0xe7e8e11bd3b5384341134dd4d71bab1f4f62f50a', used: false },
      { address: '0x7aad74b7f0d60d5867b59dbd377a71783425af47', used: false },
      { address: '0x49bd0e50ea734d54c6e9509a0f7d38c614abdaf4', used: false },
      { address: '0xaf313530c9073abdff90f3e7d744035bde70ea42', used: false },
      { address: '0x0c994e4e062f60fab6417bd9fc550bef1ff552ee', used: false },
      { address: '0x37686f72fae9160ed72d79d544c76298c6ca8e1d', used: false },
      { address: '0xf20dd95e4b2a7a3a164c91d984be6d6c99487791', used: false },
      { address: '0x2f71129b240080c638ac8d993bff52169e3551c3', used: false },
      { address: '0xc38949f9e34ae040037e1125bc1ec9c30cc228b8', used: false },
      { address: '0x63eaa4532a30215e4bd92765cd46a0b79e26315b', used: false },
      { address: '0x2202dec54e9ed0e2e0d6589ab5832bb0224a5a50', used: false },
      { address: '0xbbdbd3053f9e47314b71844064e7ef66b1bd70a7', used: false },
      { address: '0x0186360230a2c62c56c380de3f59d615be2ff250', used: false },
      { address: '0x8b060f494e438e48e26f6802119527e1ff59ca08', used: false },
      { address: '0x24e021b93264d7798c6fc1a5d25284fb14efd82c', used: false },
      { address: '0xa0e2a9b903d9f4bd45beefc2d970e8d17ddb6e2b', used: false },
      { address: '0xb416379df01eeec7581d36151f487f68f945c386', used: false },
      { address: '0xf96b132c10ce09be4ed09ed667aa5efdbace6908', used: false },
      { address: '0x5c43b737e7db0294100a5c603e12bc53f600bcea', used: false },
      { address: '0xc410c9929638ead7c76efbb384132df3e7fe6e6c', used: false },
      { address: '0x8edf06e1aac76d907f1c6564b32c0fc670f0b8ad', used: false },
      { address: '0x34f76062f2e7bc0d4b0de99494004e1af92f4b40', used: false },
      { address: '0x805a99d5f22d3593b0a15180c1bb631d4970e4f3', used: false },
      { address: '0x88f39c3f50cca582db36be9ea78a1d07124a72c8', used: false },
      { address: '0x48184910da6765111f2ea02d0182fc95be17e52d', used: false },
      { address: '0xabb36a970667e54b851bc5920ec96f4597b7a128', used: false },
      { address: '0x590d79b3d1e913819d0ea2f997b22cd22ba2ddc6', used: false },
      { address: '0xf0b04267e9f886ef53297f7eb4942d40197f84b0', used: false },
      { address: '0xe936193b31e74dbadd89e74c12d935e2ce645b49', used: false },
      { address: '0x0c8f8338386a26dbe90e4dd98c1c78ca7a5e3115', used: false },
      { address: '0x53c3ac9e7fdd3a0bc60d21fbd5c413ebe2ab2f1f', used: false },
      { address: '0x713518969b8ec1d751d5bae116c81a8495219bb9', used: false },
      { address: '0x34227bb8289fb2bf5c05f669007f43a3b258e958', used: false },
      { address: '0x449e1428a36f395c37619ef766938699fb0ddc44', used: false },
      { address: '0xe802a4d7dbb8c2010b336a49f86a765a7eb0dce8', used: false },
      { address: '0xaf2313a38605043f613e154a5fd16c19777a5ee7', used: false },
      { address: '0x26f71b3bb29849601e0fd842f461b3fc2e2af134', used: false },
      { address: '0xac6fc4c68ec5bb73ae47d1d0db4f3f605c0a35dc', used: false },
      { address: '0x40b6e45b110426176d530deac41a494802969d86', used: false },
      { address: '0xd955fd8d274958175deafc6966d517e6bfae90ef', used: false },
      { address: '0xf21947389e5066c47e89ede5306330774e23ebce', used: false },
      { address: '0x75c20a1a4355c046db473efe38bf3742c7073983', used: false },
      { address: '0xa8a2402c3610c2a812ab030742e6d405df27ef60', used: false },
      { address: '0x0186846042a92bdcc56c7af4f77921b9675fa8db', used: false },
      { address: '0x0007b980c03f153a94ddcd796f548ee216ded111', used: false },
      { address: '0x1263e7fef12d68f1a48594b6621832e1d3d43d84', used: false },
      { address: '0x0b3492cb3ce07cd3d04ed6d41e40687b688b7a7b', used: false },
      { address: '0x0286006e66565996e1f1ce30051ddfcd697a577c', used: false },
      { address: '0x850d8c94f155285ce00378282ff4082c183195c8', used: false },
      { address: '0x8f1271d480264f062d30f0309e327dfaaedc39b0', used: false },
      { address: '0x5759a4d1acc47fb85f54224edb030eb9353e79df', used: false },
      { address: '0x3fd256d72aa41b0ca8bede71f141e633736fcbea', used: false },
      { address: '0x8d9a6492fe0e8c7c3160a8275256a58e3db42cdc', used: false },
      { address: '0xb7088222ec4cfa0bacac18f95377b259a684b000', used: false },
      { address: '0xd4424449ca19abc90ec989eaa6f0da5754a4d3e0', used: false },
      { address: '0x010413711ca012525bb1fd053d2fb70dcfd933b3', used: false },
      { address: '0xc6325f5da5599974aa22d2eae00fc96231aa2f5e', used: false },
      { address: '0xd5f20a01d77823315b88e89c7fa3d2329529c711', used: false },
      { address: '0xd910cb98a61a5589aadc61a473bcb13a3fea04fd', used: false },
      { address: '0x41779d373aa2bb0c78b33cf6ad6e5ca619db173e', used: false },
      { address: '0x0da6597b89de315e0767ca747d4057a02cde602e', used: false },
      { address: '0x5a25699aa1cd35b7fc1d74e799514a8cce0dd18c', used: false },
    ],
  },
];
