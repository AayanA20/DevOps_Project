import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LikeButton from '../components/LikeButton';

describe('LikeButton Component', () => {
  it('renders initial unliked state and like count correctly', () => {
    render(<LikeButton isLiked={false} likesCount={5} onToggle={vi.fn()} />);
    
    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(screen.getByText('5 likes')).toBeInTheDocument();
  });

  it('renders singular "like" when count is 1', () => {
    render(<LikeButton isLiked={true} likesCount={1} onToggle={vi.fn()} />);
    expect(screen.getByText('1 like')).toBeInTheDocument();
  });

  it('optimistically increments count and toggles state on click', async () => {
    const handleToggle = vi.fn().mockResolvedValue();
    render(<LikeButton isLiked={false} likesCount={10} onToggle={handleToggle} />);

    const button = screen.getByRole('button', { name: /like/i });
    fireEvent.click(button);

    // Optimistic update: count jumps to 11 and aria-label changes to 'Unlike'
    expect(screen.getByText('11 likes')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Unlike');
    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it('reverts state and count if onToggle throws an error', async () => {
    const handleToggle = vi.fn().mockRejectedValue(new Error('Network failure'));
    render(<LikeButton isLiked={false} likesCount={4} onToggle={handleToggle} />);

    const button = screen.getByRole('button', { name: /like/i });
    fireEvent.click(button);

    // After failure, count should revert back to 4
    await waitFor(() => {
      expect(screen.getByText('4 likes')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Like');
    });
  });
});
