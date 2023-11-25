import React, { useContext, useEffect, useRef, useState } from 'react';
import './CreateGroupChatForm.css'; // Import CSS file for styling
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";


const CreateGroupChatForm = () => {
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]); // Assuming you have a list of friends
  const [availableMembers] = useState([
    // Sample list of available members (replace this with your data)
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    { id: 3, name: 'User 3' },
    // Add more members as needed
  ]);
  const { user } = useContext(AuthContext);

  const getFriends = async () => {
    // Fetch friends list from your backend upon component mount
    // Adjust the endpoint URL according to your API
    try {
        const res = await axios.get('/users/friends/' + user._id);
        console.log("friends" + res.data);
        setFriends(res.data);
    } catch (err) {
        console.log(err);
    }
  }
  useEffect(() => {
    getFriends();
  }, []);
    
    const handleSearch = (e) => {
        e.preventDefault();
    setSearchQuery(e.target.value);

    let filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchResults(filteredFriends);
  };

  const handleCreateGroup = () => {
    setShowForm(true);
  };

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleMemberSelection = (member) => {
    setSelectedMembers([...selectedMembers, member]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveMember = (id) => {
    const updatedMembers = selectedMembers.filter(member => member.id !== id);
    setSelectedMembers(updatedMembers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here, you can perform actions like sending data to your backend to create the group chat
    console.log('Group Name:', groupName);
    console.log('Selected Members:', selectedMembers);
    // Add logic to send data to create the group chat
  };

  return (
    <div className="create-group-container">
      {!showForm ? (
        <button className="chatSubmitButton" onClick={handleCreateGroup}>
          Create Group
        </button>
      ) : (
        <form className="group-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupName">Group Name:</label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={handleGroupNameChange}
              required
            />
          </div>
        <div className="form-group">
            <label htmlFor="searchMembers">Search Members:</label>
            <input
            type="text"
            id="searchMembers"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search friends..."
            />
            {searchResults.length > 0 && (<div className="search-results">
            <ul>
                {searchResults.map(member => (
                <li key={member.id} onClick={() => handleMemberSelection(member)}>
                    {member.username}
                </li>
                ))}
            </ul>
            </div>)}
        </div>
          <button type="submit" className="submit-button">Create Group Chat</button>
        </form>
      )}
    </div>
  );
};

export default CreateGroupChatForm;
