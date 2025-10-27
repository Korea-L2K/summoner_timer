console.log('ultimate.js loaded, socket:', window.socket);

// Load champion data
let championData = {}; // Will store: { "Aatrox": { name: "Aatrox", id: "Aatrox", cooldowns: [120, 100, 80] }, ... }
let championList = []; // Array of champion names for dropdown
let championIdMap = {}; // Maps display name to API ID: { "Aatrox": "Aatrox", "Nunu & Willump": "Nunu" }
let latestVersion = '14.23.1'; // Will be updated from API
let selectedChampions = {
  top: null,
  jg: null,
  mid: null,
  adc: null,
  sup: null
};
let ultimateLevels = {
  top: 1, // 1 = level 6, 2 = level 11, 3 = level 16
  jg: 1,
  mid: 1,
  adc: 1,
  sup: 1
};
// Store reset functions to call when champion changes
let ultimateResetFunctions = {};

// Champion name to Data Dragon format (spell file names)
const SPECIAL_CASES = {
  "Nunu & Willump": "Nunu",
  "Dr. Mundo": "DrMundo",
  "Twisted Fate": "TwistedFate",
  "Jarvan IV": "JarvanIV",
  "Master Yi": "MasterYi",
  "Miss Fortune": "MissFortune",
  "Tahm Kench": "TahmKench",
  "Aurelion Sol": "AurelionSol",
  "Lee Sin": "LeeSin",
  "Xin Zhao": "XinZhao",
  "Rek'Sai": "RekSai",
  "Renata Glasc": "Renata",
  "Bel'Veth": "Belveth",
  "Cho'Gath": "Chogath",
  "Kai'Sa": "Kaisa",
  "Kha'Zix": "Khazix",
  "Kog'Maw": "KogMaw",
  "Vel'Koz": "Velkoz",
  "K'Sante": "KSante",
  "Wukong": "MonkeyKing",
};

// Shortened display names for long champion names
const SHORTENED_DISPLAY_NAMES = {
  "Aurelion Sol": "ASol",
  "Blitzcrank": "Blitz",
  "Cassiopeia": "Cass",
  "Fiddlesticks": "Fiddle",
  "Gangplank": "GP",
  "Heimerdinger": "Heimer",
  "Miss Fortune": "MF",
  "Mordekaiser": "Morde",
  "Nunu & Willump": "Nunu",
  "Renata Glasc": "Renata",
  "Tahm Kench": "Tahm",
  "Tryndamere": "Trynd",
  "Twisted Fate": "TF"
};

// Get Data Dragon ultimate icon URL
function getUltimateIconUrl(championName) {
  // Check if we have cooldown data which includes the actual spell name
  if (championData[championName] && championData[championName].spellName) {
    return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${championData[championName].spellName}.png`;
  }

  // Fallback to champion ID + R
  const championId = championIdMap[championName] || championName.replace(/ /g, "").replace(/'/g, "");
  return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${championId}R.png`;
}

// Preload ultimate icon to check if it exists
function loadUltimateIcon(championName, callback) {
  const img = new Image();
  const url = getUltimateIconUrl(championName);

  img.onload = () => {
    console.log(`✓ Loaded icon for ${championName}`);
    callback(url);
  };

  img.onerror = () => {
    console.warn(`✗ Failed primary URL for ${championName}, trying alternatives...`);

    // Fallback 1: Try with no spaces/apostrophes
    const cleanName = championName.replace(/ /g, "").replace(/'/g, "");
    const alt1Url = `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/spell/${cleanName}R.png`;

    const alt1Img = new Image();
    alt1Img.onload = () => {
      console.log(`✓ Loaded icon for ${championName} (fallback 1)`);
      callback(alt1Url);
    };

    alt1Img.onerror = () => {
      // Fallback 2: Try without any modifications
      const alt2Url = `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/spell/${championName.replace(/[^a-zA-Z]/g, "")}R.png`;

      const alt2Img = new Image();
      alt2Img.onload = () => {
        console.log(`✓ Loaded icon for ${championName} (fallback 2)`);
        callback(alt2Url);
      };

      alt2Img.onerror = () => {
        console.error(`✗ Could not load ultimate icon for ${championName}`);
        callback(null);
      };

      alt2Img.src = alt2Url;
    };

    alt1Img.src = alt1Url;
  };

  img.src = url;
}

// Fetch champion's ultimate cooldown from Data Dragon API
async function fetchChampionCooldown(championName) {
  try {
    const championId = championIdMap[championName] || championName.replace(/ /g, "").replace(/'/g, "");
    const url = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion/${championId}.json`;

    console.log(`Fetching cooldown data for ${championName} (ID: ${championId})...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const champData = data.data[championId];

    if (!champData || !champData.spells || champData.spells.length < 4) {
      throw new Error('Invalid champion data structure');
    }

    // Get the ultimate (R) spell - it's always the 4th spell (index 3)
    const ultSpell = champData.spells[3];
    const cooldowns = ultSpell.cooldown; // Array like [120, 100, 80]
    const spellName = ultSpell.id; // The spell's actual ID/name for icon URL

    console.log(`✓ Fetched ${championName} ultimate: ${spellName}, cooldowns:`, cooldowns);

    return { cooldowns, spellName };
  } catch (error) {
    console.error(`✗ Failed to fetch ${championName} cooldown:`, error);
    return { cooldowns: [0, 0, 0], spellName: null }; // Return zeros if fetch fails
  }
}

// Get ultimate cooldown based on champion and level
function getUltimateCooldown(player) {
  const champion = selectedChampions[player];
  if (!champion) return 0;

  const champData = championData[champion];
  if (!champData || !champData.cooldowns) return 0;

  const level = ultimateLevels[player];
  return champData.cooldowns[level - 1] || 0;
}

// Create champion dropdown with search
function createChampionDropdown(player) {
  const dropdown = document.createElement('div');
  dropdown.className = 'champion-dropdown hidden';
  dropdown.dataset.player = player;

  dropdown.innerHTML = `
    <input type="text" class="champion-search" placeholder="Search champion..." autocomplete="off">
    <div class="champion-list"></div>
  `;

  return dropdown;
}

// Populate champion list
function populateChampionList(dropdown, filter = '') {
  const list = dropdown.querySelector('.champion-list');
  const filterLower = filter.toLowerCase();

  const filtered = championList.filter(name =>
    name.toLowerCase().includes(filterLower)
  );

  list.innerHTML = filtered.map(name =>
    `<div class="champion-option" data-champion="${name}">${name}</div>`
  ).join('');

  console.log(`Showing ${filtered.length} of ${championList.length} champions`);
}

// Initialize all ultimate timer functionality
function initializeUltimateTimers() {
  console.log('Initializing ultimate timers...');

  const ultimateButtons = document.querySelectorAll('.ultimate-timer-button');
  console.log(`Found ${ultimateButtons.length} ultimate timer buttons`);

  const championSelects = document.querySelectorAll('.champion-select');
  console.log(`Found ${championSelects.length} champion select buttons`);

  const levelToggles = document.querySelectorAll('.level-toggle');
  console.log(`Found ${levelToggles.length} level toggle buttons`);

  // Initialize ultimate timer buttons
  document.querySelectorAll('.ultimate-timer-button').forEach(btn => {
  const player = btn.parentElement.dataset.player;
  let timerInterval = null;

  let currentIconUrl = null;
  let currentChampion = null;

  const reset = (forceReload = false) => {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.classList.remove('dimmed');

    // Show champion icon or default 'R'
    if (selectedChampions[player]) {
      // Check if champion changed
      if (currentChampion !== selectedChampions[player]) {
        currentChampion = selectedChampions[player];
        currentIconUrl = null; // Clear cached icon for new champion
        forceReload = true;
      }

      // If we already have an icon URL and don't need to reload, use it immediately
      if (currentIconUrl && !forceReload) {
        btn.style.setProperty('--bg-image', `url("${currentIconUrl}")`);
        btn.textContent = '';
      } else {
        // Show 'R' while loading
        btn.textContent = 'R';

        // Load icon asynchronously
        loadUltimateIcon(selectedChampions[player], (iconUrl) => {
          currentIconUrl = iconUrl;
          if (iconUrl) {
            btn.style.setProperty('--bg-image', `url("${iconUrl}")`);
            // Only clear text if we're not showing a timer
            if (!timerInterval) {
              btn.textContent = '';
            }
          } else {
            btn.style.setProperty('--bg-image', 'none');
          }
        });
      }
    } else {
      currentChampion = null;
      currentIconUrl = null;
      btn.style.setProperty('--bg-image', 'none');
      btn.textContent = 'R';
    }
  };

  // Store reset function for this player
  ultimateResetFunctions[player] = reset;

  const updateText = (remaining) => {
    remaining = Math.round(remaining);
    const min = Math.floor(remaining / 60);
    const sec = Math.floor(remaining) % 60;
    btn.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    btn.classList.add('dimmed');
  };

  reset();

  btn.addEventListener('click', (e) => {
    if (!selectedChampions[player]) {
      // Open champion selector instead of showing alert
      e.stopPropagation();
      const championSelectBtn = document.querySelector(`.champion-select[data-player="${player}"]`);
      if (championSelectBtn && championSelectBtn.openDropdown) {
        championSelectBtn.openDropdown();
      } else if (championSelectBtn) {
        championSelectBtn.click();
      }
      return;
    }

    if (timerInterval) {
      window.socket.emit('reset-ultimate-timer', { player });
      return;
    }

    const base = getUltimateCooldown(player);
    if (base === 0) {
      // For champions with special ultimates, still allow clicking but don't start timer
      return;
    }

    // Only lucidity boots affects ultimate cooldown (10 AH)
    const hasteValue = (window.haste && window.haste.lucidity[player]) ? 10 : 0;
    const cooldown = base * (100 / (100 + hasteValue));

    window.socket.emit('start-ultimate-timer', { player, end: Date.now() + cooldown * 1000 });
  });

  window.socket.on('start-ultimate-timer', (data) => {
    if (data.player === player) {
      reset();
      let remaining = (data.end - Date.now()) / 1000;
      updateText(remaining);
      timerInterval = setInterval(() => {
        remaining = (data.end - Date.now()) / 1000;
        if (remaining < 0.5) {
          reset();
        } else {
          updateText(remaining);
        }
      }, 1000);
    }
  });

  window.socket.on('reset-ultimate-timer', (data) => {
    if (data.player === player) {
      reset();
    }
  });

  window.socket.on('set-champion', (data) => {
    if (data.player === player) {
      selectedChampions[player] = data.champion;
      reset();
    }
  });

  window.socket.on('set-ultimate-level', (data) => {
    if (data.player === player) {
      ultimateLevels[player] = data.level;
      reset();
    }
  });
  });

  // Initialize champion select buttons
  document.querySelectorAll('.champion-select').forEach(btn => {
    const player = btn.dataset.player;
    const dropdown = createChampionDropdown(player);
    btn.parentElement.appendChild(dropdown);

    const openDropdown = () => {
      // Close all other dropdowns
      document.querySelectorAll('.champion-dropdown:not(.hidden)').forEach(d => {
        if (d !== dropdown) d.classList.add('hidden');
      });

      dropdown.classList.remove('hidden');
      populateChampionList(dropdown);

      // Position dropdown below button using fixed positioning
      setTimeout(() => {
        const btnRect = btn.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Position below button by default
        dropdown.style.left = `${btnRect.left}px`;
        dropdown.style.top = `${btnRect.bottom}px`;
        dropdown.style.bottom = 'auto';

        // Check if dropdown fits below the button
        const dropdownBottom = btnRect.bottom + dropdownRect.height;
        if (dropdownBottom > viewportHeight) {
          // Align bottom of dropdown to bottom of viewport
          dropdown.style.top = 'auto';
          dropdown.style.bottom = '0';
        }
      }, 0);

      dropdown.querySelector('.champion-search').focus();
    };

    // Store openDropdown function so ultimate timer can access it
    btn.openDropdown = openDropdown;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (dropdown.classList.contains('hidden')) {
        openDropdown();
      } else {
        dropdown.classList.add('hidden');
      }
    });

    // Search functionality
    dropdown.querySelector('.champion-search').addEventListener('input', (e) => {
      populateChampionList(dropdown, e.target.value);
    });

    // Function to set champion name (using shortened version if needed)
    const setChampionName = (name) => {
      const displayName = SHORTENED_DISPLAY_NAMES[name] || name;
      btn.innerHTML = `<span>${displayName}</span>`;
    };

    // Champion selection
    dropdown.addEventListener('click', async (e) => {
      if (e.target.classList.contains('champion-option')) {
        const champion = e.target.dataset.champion;
        selectedChampions[player] = champion;
        setChampionName(champion);
        dropdown.classList.add('hidden');

        // Fetch cooldown data for this champion if not already cached
        if (!championData[champion]) {
          const data = await fetchChampionCooldown(champion);
          championData[champion] = {
            name: champion,
            cooldowns: data.cooldowns || data, // Handle both new object format and old array format
            spellName: data.spellName
          };
        }

        // Update the ultimate timer button icon for this player
        if (ultimateResetFunctions[player]) {
          ultimateResetFunctions[player](true); // Force reload icon
        }

        window.socket.emit('set-champion', { player, champion });
      }
    });
  });

  // Initialize level toggle buttons
  document.querySelectorAll('.level-toggle').forEach(btn => {
    const player = btn.dataset.player;

    const updateDisplay = () => {
      const level = ultimateLevels[player];
      const displayLevel = level === 1 ? 6 : level === 2 ? 11 : 16;
      btn.textContent = displayLevel;
    };

    updateDisplay();

    btn.addEventListener('click', () => {
      ultimateLevels[player] = (ultimateLevels[player] % 3) + 1;
      updateDisplay();
      window.socket.emit('set-ultimate-level', { player, level: ultimateLevels[player] });
    });

    window.socket.on('set-ultimate-level', (data) => {
      if (data.player === player) {
        ultimateLevels[player] = data.level;
        updateDisplay();
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.champion-dropdown') && !e.target.closest('.champion-select')) {
      document.querySelectorAll('.champion-dropdown:not(.hidden)').forEach(d => d.classList.add('hidden'));
    }
  });

  console.log('Ultimate timers initialized successfully');
}

// Fetch latest version and champion list from Data Dragon
async function initializeChampionData() {
  try {
    // Get latest version
    const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionsResponse.json();
    latestVersion = versions[0];
    console.log(`Latest patch version: ${latestVersion}`);

    // Get champion list
    const champListResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
    const champListData = await champListResponse.json();

    // Extract champion names and build ID map
    championList = Object.values(champListData.data).map(champ => {
      championIdMap[champ.name] = champ.id; // Map display name to API ID
      return champ.name;
    }).sort();
    console.log(`Loaded ${championList.length} champions`);
    console.log('Champion ID mapping sample:', Object.entries(championIdMap).slice(0, 5));

    // Try to load cached cooldowns from file (optional)
    try {
      const cacheResponse = await fetch('champion_cooldowns.json');
      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json();
        // Convert array to object format
        cacheData.champions.forEach(champ => {
          championData[champ.name] = champ;
        });
        console.log(`Loaded cached cooldowns for ${cacheData.champions.length} champions`);
      }
    } catch (err) {
      console.log('No cached cooldowns found, will fetch on demand');
    }

    initializeUltimateTimers();
  } catch (error) {
    console.error('Error initializing champion data:', error);
    // Fallback: Initialize with empty data
    championList = [];
    initializeUltimateTimers();
  }
}

initializeChampionData();
