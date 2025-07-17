import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext.jsx';

export default function GameDetails() {
    const { id } = useParams();
    const { state } = useLocation();
    const { addToCart, cart } = useCart();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // First check if game was passed via state
        if (state?.game) {
            // Ensure we have a valid ID
            const gameId = state.game.id || id;
            if (!gameId || gameId === 'undefined') {
                setError('Invalid game ID');
                return;
            }

            setGame({
                id: gameId,
                title: state.game.title,
                price: parseFloat(state.game.price),
                image_url: state.game.image_url
            });
            setLoading(false);
            return;
        }

        // If not, fetch from API
        const fetchGame = async () => {
            try {
                const response = await fetch(`/api/games/${id}`);
                if (!response.ok) throw new Error('Game not found');
                const data = await response.json();

                setGame({
                    id: data.id || data.game_id || id, // Multiple fallbacks
                    title: data.title,
                    price: parseFloat(data.price),
                    image_url: data.image_url
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
    }, [id, state]);

    const handleAddToCart = () => {
        console.log('Adding to cart:', game); // Debug
        if (!game) return;

        // Create a clean cart item object
        const cartItem = {
            id: game.id,
            title: game.title,
            price: game.price,
            image_url: game.image_url
        };

        addToCart(cartItem);
    };

    const isInCart = game ? cart.some(item =>
        item.id && game.id && String(item.id) === String(game.id)
    ) : false;

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!game) return <Alert variant="warning">Game not found</Alert>;

    return (
        <Container className="py-5">
            <Row>
                <Col md={6}>
                    <img src={game.image_url} alt={game.title} className="img-fluid" />
                </Col>
                <Col md={6}>
                    <h1>{game.title}</h1>
                    <p>${game.price.toFixed(2)}</p>
                    <Button
                        variant={isInCart ? "success" : "primary"}
                        onClick={handleAddToCart}
                        disabled={isInCart}
                    >
                        {isInCart ? '✓ Added to Cart' : 'Add to Cart'}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}