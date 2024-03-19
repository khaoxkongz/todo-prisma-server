const mapToUserLogin = (userId: number, username: string, token: string) => {
  const userInfo = {
    status: "logged in",
    id: userId,
    username: username,
    token: token,
  };

  return userInfo;
};

export { mapToUserLogin as mapToUser };
