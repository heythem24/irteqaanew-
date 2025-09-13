// Test script to verify club-league association
import { ClubsService, LeaguesService } from './services/firestoreService.js';

async function testClubLeagueAssociation() {
  console.log('=== Testing Club-League Association ===');
  
  try {
    // Get all leagues
    const leagues = await LeaguesService.getAllLeagues();
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.error('No leagues found. Cannot test club-league association.');
      return;
    }
    
    // Test with the first league
    const testLeague = leagues[0];
    console.log(`Testing with league: ${testLeague.nameAr} (ID: ${testLeague.id}, Wilaya ID: ${testLeague.wilayaId})`);
    
    // Get clubs for this league using our fixed function
    const clubs = await ClubsService.getClubsByLeagueFlexible(testLeague.id, testLeague.wilayaId);
    console.log(`Found ${clubs.length} clubs for league ${testLeague.nameAr}`);
    
    if (clubs.length > 0) {
      console.log('✅ Club-league association is working correctly!');
      console.log('Sample clubs:');
      clubs.slice(0, 3).forEach(club => {
        console.log(`- ${club.nameAr} (League ID: ${club.leagueId})`);
      });
    } else {
      console.log('❌ No clubs found for this league. This might indicate an issue.');
      
      // Let's check if there are any clubs at all
      const allClubs = await ClubsService.getAllClubs();
      console.log(`Total clubs in database: ${allClubs.length}`);
      
      if (allClubs.length > 0) {
        console.log('Sample clubs from database:');
        allClubs.slice(0, 3).forEach(club => {
          console.log(`- ${club.nameAr} (League ID: ${club.leagueId})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testClubLeagueAssociation();