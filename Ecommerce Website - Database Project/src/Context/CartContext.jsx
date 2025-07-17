import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('gameStoreCart');
            return saved ? JSON.parse(saved) : [];
        } catch (err) {
            console.error('Failed to load cart:', err);
            return [];
        }
    });

    const [cartError, setCartError] = useState(null);

    useEffect(() => {
        try {
            localStorage.setItem('gameStoreCart', JSON.stringify(cart));
        } catch (err) {
            console.error('Failed to save cart:', err);
        }
    }, [cart]);

    const addToCart = (game) => {
        // More robust validation
        const validId = game?.id && game.id !== 'undefined' && !isNaN(game.id);
        if (!validId || !game?.title || isNaN(game?.price)) {
            console.error('Invalid game data:', game);
            setCartError(`Invalid game data - ${!validId ? 'Missing ID' : 'Invalid price'}`);
            return;
        }

        setCart(prevCart => {
            const price = typeof game.price === 'string' ?
                parseFloat(game.price) :
                game.price;

            // Use the first valid ID found
            const itemId = game.id || game.game_id;

            const existingItem = prevCart.find(item => item.id === itemId);

            if (existingItem) {
                return prevCart.map(item =>
                    item.id === itemId ? {
                        ...item,
                        quantity: item.quantity + 1
                    } : item
                );
            }

            return [...prevCart, {
                id: itemId,
                title: game.title,
                price: price,
                image_url: game.image_url,
                quantity: 1
            }];
        });
    };


    const removeFromCart = (gameId) => {
        setCart(prev => prev.filter(item => item.id !== gameId));
    };

    const updateQuantity = (gameId, quantity) => {
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity)) return;

        if (numQuantity < 1) return removeFromCart(gameId);
        setCart(prev =>
            prev.map(item =>
                item.id === gameId ? { ...item, quantity: numQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        setCartError(null);
    };

    const checkout = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));

            // Check if user is logged in
            if (!userData?.userId) {
                throw new Error('Please login to checkout');
            }

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: cart.map(item => ({
                        id: item.id,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    userId: userData.userId // ← FIX: Changed 'userId' to 'userData.userId'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Checkout failed');
            }

            const result = await response.json();
            console.log('Checkout successful, order ID:', result.orderId);
            return result.orderId;

        } catch (err) {
            console.error("Checkout error details:", {
                error: err,
                message: err.message,
                // For debugging:
                localStorageUserData: localStorage.getItem('user')
            });
            throw err;
        }
    };



    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce(
        (sum, item) => sum + (Math.round(item.price * 100) * item.quantity),
        0
    ) / 100;

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            checkout,
            totalItems,
            subtotal,
            cartError,
            setCartError
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};


