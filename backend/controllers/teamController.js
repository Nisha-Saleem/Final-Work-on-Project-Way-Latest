import Team from '../models/Team.js';

// Create or update a team
export const saveTeam = async (req, res) => {
  console.log('👥 [Teams] Save team request received');
  console.log('👥 [Teams] Request body:', req.body);
  
  try {
    const { groupId, projectName, leaderName, leaderPassword, members } = req.body;

    if (!groupId) {
      console.log('⚠️ [Teams] Missing groupId in request');
      return res.status(400).json({ 
        success: false, 
        message: 'groupId is required' 
      });
    }

    console.log('👥 [Teams] Checking if team exists for groupId:', groupId);
    // Check if team already exists for this groupId
    const existingTeam = await Team.findOne({ groupId });
    
    if (existingTeam) {
      console.log('👥 [Teams] Updating existing team...');
      // Update existing team
      existingTeam.projectName = projectName;
      existingTeam.leaderName = leaderName;
      existingTeam.leaderPassword = leaderPassword;
      existingTeam.members = members;
      const updatedTeam = await existingTeam.save();
      console.log('✅ [Teams] Team updated successfully for groupId:', groupId);

      res.status(200).json({ 
        success: true, 
        message: 'Team updated successfully!',
        team: updatedTeam 
      });
    } else {
      console.log('👥 [Teams] Creating new team...');
      // Create new team
      const newTeam = new Team({
        groupId,
        projectName,
        leaderName,
        leaderPassword,
        members
      });

      const savedTeam = await newTeam.save();
      console.log('✅ [Teams] Team created successfully for groupId:', groupId);

      res.status(201).json({ 
        success: true, 
        message: 'Team created successfully!',
        team: savedTeam 
      });
    }
  } catch (error) {
    console.error('❌ [Teams] Error saving team:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving team', 
      error: error.message 
    });
  }
};

// Get team by project name (deprecated - use getTeamByGroupId instead)
export const getTeamByProject = async (req, res) => {
  console.log('👥 [Teams] Get team by project request received (deprecated)');
  console.log('👥 [Teams] Project name:', req.params.projectName);
  
  try {
    const { projectName } = req.params;
    const team = await Team.findOne({ projectName });

    if (!team) {
      console.log('⚠️ [Teams] Team not found:', projectName);
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      });
    }

    console.log('✅ [Teams] Team retrieved successfully:', projectName);
    res.status(200).json({ success: true, team });
  } catch (error) {
    console.error('❌ [Teams] Error fetching team:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching team', 
      error: error.message 
    });
  }
};

// Get team by groupId
export const getTeamByGroupId = async (req, res) => {
  console.log('👥 [Teams] Get team by groupId request received');
  console.log('👥 [Teams] Group ID:', req.params.groupId);
  
  try {
    const { groupId } = req.params;
    const team = await Team.findOne({ groupId });

    if (!team) {
      console.log('⚠️ [Teams] Team not found for groupId:', groupId);
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      });
    }

    console.log('✅ [Teams] Team retrieved successfully for groupId:', groupId);
    res.status(200).json({ success: true, team });
  } catch (error) {
    console.error('❌ [Teams] Error fetching team by groupId:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching team', 
      error: error.message 
    });
  }
};

// Verify leader password
export const verifyLeaderPassword = async (req, res) => {
  console.log('👥 [Teams] Verify leader password request received');
  console.log('👥 [Teams] Project name:', req.body.projectName);
  
  try {
    const { projectName, password } = req.body;
    const team = await Team.findOne({ projectName });

    if (!team) {
      console.log('⚠️ [Teams] Team not found:', projectName);
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      });
    }

    if (team.leaderPassword !== password) {
      console.log('⚠️ [Teams] Invalid password for project:', projectName);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    console.log('✅ [Teams] Password verified successfully for:', projectName);
    res.status(200).json({ 
      success: true, 
      message: 'Password verified successfully',
      leaderName: team.leaderName,
      members: team.members,
      groupId: team.groupId
    });
  } catch (error) {
    console.error('❌ [Teams] Error verifying password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying password', 
      error: error.message 
    });
  }
};

// Update project name
export const updateProjectName = async (req, res) => {
  console.log('👥 [Teams] Update project name request received');
  console.log('👥 [Teams] Old project name:', req.body.oldProjectName);
  console.log('👥 [Teams] New project name:', req.body.newProjectName);
  
  try {
    const { oldProjectName, newProjectName } = req.body;

    const team = await Team.findOne({ projectName: oldProjectName });

    if (!team) {
      console.log('⚠️ [Teams] Team not found:', oldProjectName);
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      });
    }

    team.projectName = newProjectName;
    const updatedTeam = await team.save();
    console.log('✅ [Teams] Project name updated successfully:', oldProjectName, '->', newProjectName);

    res.status(200).json({ 
      success: true, 
      message: 'Project name updated successfully',
      team: updatedTeam 
    });
  } catch (error) {
    console.error('❌ [Teams] Error updating project name:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating project name', 
      error: error.message 
    });
  }
};

// Delete team
export const deleteTeam = async (req, res) => {
  console.log('👥 [Teams] Delete team request received');
  console.log('👥 [Teams] Project name:', req.params.projectName);
  
  try {
    const { projectName } = req.params;
    const deletedTeam = await Team.findOneAndDelete({ projectName });

    if (!deletedTeam) {
      console.log('⚠️ [Teams] Team not found:', projectName);
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      });
    }

    console.log('✅ [Teams] Team deleted successfully:', projectName);
    res.status(200).json({ 
      success: true, 
      message: 'Team deleted successfully' 
    });
  } catch (error) {
    console.error('❌ [Teams] Error deleting team:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting team', 
      error: error.message 
    });
  }
};
