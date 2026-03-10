#!/usr/bin/env node

/**
 * VERIFICATION: Ensure periodization plan uses ALL 10 categories
 * Generates 50 simulated plans and tracks which categories appear
 */

const fs = require('fs');
const path = require('path');

// Parse all categories from source files
function extractAllCategories() {
  const classified = fs.readFileSync(
    path.join(__dirname, 'src/lib/sessions-data-classified.ts'),
    'utf8'
  );
  const research = fs.readFileSync(
    path.join(__dirname, 'src/lib/research-workouts.ts'),
    'utf8'
  );

  const allContent = classified + research;
  const categories = new Set();

  const matches = allContent.match(/category:\s*['\"]([^'\"]+)['\"]/g) || [];
  matches.forEach(m => {
    const cat = m.match(/['\"]([^'\"]+)['\"]/)[1];
    categories.add(cat);
  });

  return Array.from(categories).sort();
}

// Extract workouts by category
function extractWorkoutsByCategory() {
  const classified = fs.readFileSync(
    path.join(__dirname, 'src/lib/sessions-data-classified.ts'),
    'utf8'
  );
  const research = fs.readFileSync(
    path.join(__dirname, 'src/lib/research-workouts.ts'),
    'utf8'
  );

  const allContent = classified + research;
  const workoutsByCategory = {};

  // Find all workout blocks
  const blocks = allContent.match(
    /{\s*id:\s*['\"]([^'\"]+)['\"][^}]*?category:\s*['\"]([^'\"]+)['\"]/g
  ) || [];

  blocks.forEach(block => {
    const idMatch = block.match(/id:\s*['\"]([^'\"]+)['\"]/);
    const catMatch = block.match(/category:\s*['\"]([^'\"]+)['\"]/);
    
    if (idMatch && catMatch) {
      const id = idMatch[1];
      const cat = catMatch[1];
      
      if (!workoutsByCategory[cat]) {
        workoutsByCategory[cat] = [];
      }
      workoutsByCategory[cat].push(id);
    }
  });

  return workoutsByCategory;
}

// Simulate plan generation logic
function simulatePlan(blockType, userSeed) {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayIndex = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };
  
  const blockZones = {
    'BASE': 'BASE',
    'THRESHOLD': 'THRESHOLD',
    'VO2MAX': 'VO2MAX',
    'RACE_SIM': 'RACE_SIM'  // RACE_SIM block uses RACE_SIM category on Monday
  };
  
  const categoryRotations = {
    1: ["SWEET_SPOT", "TEMPO", "SPRINT", "RECOVERY"],  // TUE
    2: ["RECOVERY", "BASE", "SWEET_SPOT", "TEMPO"],    // WED
    3: ["THRESHOLD", "SPRINT", "VO2MAX", "TEMPO"],     // THU
    4: ["SPRINT", "ANAEROBIC", "FTP_TEST", "RECOVERY"],// FRI
  };
  
  const usedCategories = new Set();
  const plan = {};
  
  days.forEach((day) => {
    const dayIdx = dayIndex[day];
    const isMonday = dayIdx === 0;
    const isRestDay = dayIdx === 2 || dayIdx === 5 || dayIdx === 6;
    
    if (isRestDay) {
      plan[day] = 'REST';
      return;
    }
    
    let selectedCategory = blockZones[blockType];
    
    // For non-Monday, use category rotations
    if (!isMonday) {
      const dayOffset = dayIdx * 10;
      const userHash = userSeed ? Math.abs(
        userSeed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
      ) : 0;
      const seed = (dayOffset + userHash) % 1000;
      
      const rotation = categoryRotations[dayIdx];
      if (rotation && rotation.length > 0) {
        const categoryIndex = seed % rotation.length;
        selectedCategory = rotation[categoryIndex];
      }
    }
    
    plan[day] = selectedCategory;
    usedCategories.add(selectedCategory);
  });
  
  return { plan, usedCategories: Array.from(usedCategories).sort() };
}

// Main
function main() {
  console.log('═'.repeat(100));
  console.log('CATEGORY COVERAGE ANALYSIS');
  console.log('═'.repeat(100));
  
  const allCategories = extractAllCategories();
  const workoutsByCategory = extractWorkoutsByCategory();
  
  console.log('\n📚 Database has ' + allCategories.length + ' categories:\n');
  allCategories.forEach((cat, i) => {
    const count = workoutsByCategory[cat] ? workoutsByCategory[cat].length : 0;
    console.log('  ' + (i+1) + '. ' + cat + ' (' + count + ' workouts)');
  });
  
  // Simulate 50 plans across all block types
  const blockTypes = ['BASE', 'THRESHOLD', 'VO2MAX', 'RACE_SIM'];
  const globalCategoriesUsed = new Set();
  const categoryUsageCount = {};
  
  allCategories.forEach(cat => {
    categoryUsageCount[cat] = 0;
  });
  
  console.log('\n🧪 Simulating 50 plans across 4 block types (200 total)...\n');
  
  let planCount = 0;
  blockTypes.forEach(blockType => {
    for (let i = 0; i < 50; i++) {
      const userSeed = 'user_' + i + '_' + blockType;
      const { usedCategories } = simulatePlan(blockType, userSeed);
      
      usedCategories.forEach(cat => {
        globalCategoriesUsed.add(cat);
        categoryUsageCount[cat]++;
      });
      
      planCount++;
    }
  });
  
  console.log('✅ Simulated ' + planCount + ' plans\n');
  
  // Report coverage
  console.log('═'.repeat(100));
  console.log('CATEGORY USAGE ACROSS ALL SIMULATED PLANS');
  console.log('═'.repeat(100) + '\n');
  
  const sortedByUsage = Object.entries(categoryUsageCount)
    .sort((a, b) => b[1] - a[1]);
  
  const used = [];
  const unused = [];
  
  sortedByUsage.forEach(([cat, count]) => {
    if (count > 0) {
      used.push({ cat, count });
    } else {
      unused.push(cat);
    }
  });
  
  used.forEach(({ cat, count }) => {
    const pct = ((count / planCount) * 100).toFixed(1);
    const bar = '█'.repeat(Math.ceil(count / 5));
    console.log(`  ${cat.padEnd(15)} ${bar} ${count.toString().padEnd(3)} times (${pct}%)`);
  });
  
  console.log('\n📊 Summary:\n');
  console.log('  Categories USED:   ' + used.length + ' / ' + allCategories.length);
  console.log('  Categories UNUSED: ' + unused.length + ' / ' + allCategories.length);
  
  if (unused.length > 0) {
    console.log('\n⚠️  NOT USED:');
    unused.forEach(cat => {
      console.log('    - ' + cat);
    });
  } else {
    console.log('\n✅ ALL CATEGORIES USED!');
  }
  
  console.log('\n' + '═'.repeat(100) + '\n');
  
  if (unused.length === 0) {
    console.log('🎉 SUCCESS: All ' + allCategories.length + ' categories appear in simulated plans\n');
    process.exit(0);
  } else {
    console.log('❌ ISSUE: ' + unused.length + ' categories not appearing in plans\n');
    process.exit(1);
  }
}

main();
