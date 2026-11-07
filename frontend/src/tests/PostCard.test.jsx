import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PostCard from '../components/PostCard';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { _id: 'author_1', username: 'test_creator' },
  }),
}));

describe('PostCard Component', () => {
  const mockPost = {
    _id: 'post_100',
    caption: 'Sunset over Mumbai skyline #goldenhour',
    imageUrl: 'https://images.unsplash.com/photo-sunset.jpg',
    user: {
      _id: 'author_1',
      username: 'test_creator',
      profilePicture: 'https://example.com/avatar.jpg',
    },
    likes: ['user_2', 'user_3'],
    comments: [
      {
        _id: 'c1',
        text: 'Breathtaking view!',
        user: { username: 'traveler' },
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };

  it('renders author username, caption, and media image correctly', () => {
    render(
      <MemoryRouter>
        <PostCard
          post={mockPost}
          onLikeToggle={vi.fn()}
          onAddComment={vi.fn()}
          onDeletePost={vi.fn()}
        />
      </MemoryRouter>
    );

    // Author username appears in header and beside caption
    const authorElements = screen.getAllByText('test_creator');
    expect(authorElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Sunset over Mumbai skyline #goldenhour')).toBeInTheDocument();
    
    const postImg = screen.getByAltText(mockPost.caption);
    expect(postImg).toBeInTheDocument();
    expect(postImg).toHaveAttribute('src', mockPost.imageUrl);
  });

  it('renders like count and delete button for post author', () => {
    render(
      <MemoryRouter>
        <PostCard
          post={mockPost}
          onLikeToggle={vi.fn()}
          onAddComment={vi.fn()}
          onDeletePost={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('2 likes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete post/i })).toBeInTheDocument();
  });
});
