function ListGroup() {
  const listArr = ["Rocket league", "fortnite", "PUBG"];

  return (
    <>
      <h1>Games:</h1>
      <ul className="list-group">
        {listArr.map((item) => (<li className="list-group-item">{item}</li>))}
      </ul>
    </>
  );
}

export default ListGroup;
