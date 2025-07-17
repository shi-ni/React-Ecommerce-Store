import { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Container, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Helper function to safely handle prices
const formatPrice = (price) => {
    // Convert to number if it's a string
    const numberPrice = typeof price === 'string' ? parseFloat(price) : price;
    // If not a number, return $0.00
    return isNaN(numberPrice) ? '$0.00' : `$${numberPrice.toFixed(2)}`;
};

export default function GamesList() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get('/api/games');

                // Transform data safely
                const safeGames = response.data.map(game => ({
                    id: game.id || game.game_id, // Use either ID field
                    title: game.title || 'Untitled Game',
                    price: typeof game.price === 'number' ? game.price : parseFloat(game.price || 0),
                    image_url: game.image_url || '/placeholder-image.jpg',
                    description: game.description || ''
                }));

                setGames(safeGames);
            } catch (err) {
                setError("Failed to load games. Please try again later.");
                console.error("Error loading games:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    if (loading) return (
        <Container className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading games...</p>
        </Container>
    );

    if (error) return (
        <Container className="py-5">
            <Alert variant="danger">{error}</Alert>
            <Button onClick={() => window.location.reload()} variant="primary">
                Try Again
            </Button>
        </Container>
    );

    return (
        <Container>
            <h1 className="my-4">All Games</h1>
            <Row>
                {games.map((game) => (
                    <Col key={game.id} md={4} className="mb-4">
                        <Card style={{ height: '100%' }}>
                            <Card.Img
                                variant="top"
                                src={game.image_url}
                                style={{
                                    height: '200px',
                                    objectFit: 'cover',
                                    backgroundColor: '#f5f5f5'
                                }}
                                alt={game.title}
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg'
                                }}
                            />
                            <Card.Body className="d-flex flex-column">
                                <Card.Title>{game.title}</Card.Title>
                                <Card.Text className="text-success">
                                    {formatPrice(game.price)}
                                </Card.Text>
                                <Button
                                    as={Link}
                                    to={`/game/${game.id}`}
                                    state={{ game }}
                                    variant="primary"
                                    className="mt-auto"
                                >
                                    View Details
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}