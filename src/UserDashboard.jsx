import React, { useState, useEffect } from "react";
import _ from "lodash";

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("https://reqres.in/api/users?per_page=12");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        // Add a mock department to each user for demonstration purposes
        const usersWithDepartments = data.data.map((user) => ({
          ...user,
          department: _.sample(["HR", "IT", "Finance", "Marketing"]),
        }));
        setUsers(usersWithDepartments);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const debouncedSearch = _.debounce((term) => {
      const filtered = _.filter(users, (user) =>
        _.some(user, (value) =>
          _.includes(_.toLower(value.toString()), _.toLower(term))
        )
      );
      setFilteredUsers(filtered);
    }, 300);

    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setFilteredUsers([]);
    }

    return () => debouncedSearch.cancel();
  }, [searchTerm, users]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const displayUsers = filteredUsers.length > 0 ? filteredUsers : users;
  const groupedUsers = _.groupBy(displayUsers, "department");
  const sortedDepartments = _.sortBy(Object.keys(groupedUsers));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {sortedDepartments.map((department) => (
        <div key={department}>
          <h2>{_.startCase(department)}</h2>
          <ul>
            {_.sortBy(groupedUsers[department], "first_name").map((user) => (
              <li key={user.id}>
                {user.first_name} {user.last_name} - {user.email}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default UserDashboard;
