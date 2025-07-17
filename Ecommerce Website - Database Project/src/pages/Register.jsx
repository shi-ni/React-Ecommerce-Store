import { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!formData.username || !formData.email || !formData.password) {
            setError('Please fill all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:5000/register',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess(response.data.message);
            setFormData({ username: '', email: '', password: '' });

            // Optional: Redirect after 2 seconds
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: '500px' }}>
            <h2>Create Account</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </Form.Group>

                <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            <span className="ms-2">Registering...</span>
                        </>
                    ) : 'Register'}
                </Button>
            </Form>

            <p className="mt-3 text-center">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </Container>
    );
}