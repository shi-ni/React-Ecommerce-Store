import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap'; // Fixed import
import axios from 'axios';

export default function Homepage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'action', 'adventure'
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.userId) {
            setCurrentUser(user);
        }
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/api/games')
            .then(res => {
                setGames(res.data);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                setError("Failed to load games. Please refresh the page.");
            });
    }, []);

    // Filter games by genre
    const filteredGames = filter === 'all'
        ? games
        : games.filter(game => game.genre === filter);

    return (
        <Container className="py-5">
            {/* Hero Section */}
            <Row className="mb-5 text-center bg-dark text-white p-4 rounded">
                <Col>
                    <h1>Welcome to GameStore</h1>
                    <p className="lead">Discover your next favorite game!</p>
                    {currentUser && (
                        <p className="mt-2 mb-0">
                            <small>Logged in as: <strong>{currentUser.username || currentUser.email}</strong></small>
                        </p>
                    )}
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-4">
                <Col md={4}>
                    <Form.Select
                        onChange={(e) => setFilter(e.target.value)}
                        aria-label="Filter by genre"
                    >
                        <option value="all">All Genres</option>
                        <option value="action">Action</option>
                        <option value="adventure">Adventure</option>
                        <option value="strategy">Strategy</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* Loading/Error States */}
            {loading && (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            {error && (
                <Alert variant="danger">{error}</Alert>
            )}

            {/* Game Grid */}
            <Row xs={1} md={2} lg={3} className="g-4">
                {filteredGames.map(game => (
                    <Col key={game.id}>
                        <Card className="h-100 shadow-sm">
                            <Card.Img
                                variant="top"
                                src={game.image_url || 'https://via.placeholder.com/300x200'}
                                alt={game.title}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <Card.Body>
                                <Card.Title>{game.title}</Card.Title>
                                <Card.Text className="text-muted">
                                    {game.genre} • ${game.price}
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer className="bg-white">
                                <button className="btn btn-primary w-100">
                                    View Details
                                </button>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}
