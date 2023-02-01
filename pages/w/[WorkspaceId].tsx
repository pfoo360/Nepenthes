import React from "react";

const WorkspaceId = () => {
  return <div>wkspcid</div>;
};

export default WorkspaceId;

export const getServerSideProps = ({ req, res }) => {
  console.log(req);

  return { props: {} };
};
