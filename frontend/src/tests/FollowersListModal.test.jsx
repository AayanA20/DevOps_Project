import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FollowersListModal from '../components/FollowersListModal';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { _id: 'my-user-id', username: 'current_user' },
  }),
}));

const dummyFollowers = [
  { _id: 'u1', username: 'john_doe', bio: 'Photographer', followers: [] },
];
const dummyFollowing = [
  { _id: 'u2', username: 'sarah_dev', bio: 'Full stack dev', followers: ['my-user-id'] },
];

vi.mock('../services/userService', () => ({
  userService: {
    getFollowers: vi.fn().mockImplementation(() =>
      Promise.resolve({ success: true, followers: dummyFollowers })
    ),
    getFollowing: vi.fn().mockImplementation(() =>
      Promise.resolve({ success: true, following: dummyFollowing })
    ),
    followUser: vi.fn().mockResolvedValue({ success: true }),
    unfollowUser: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe('FollowersListModal Component', () => {

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <FollowersListModal
        isOpen={false}
        onClose={vi.fn()}
        userId="test-id"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders followers list and tabs when isOpen is true', async () => {
    await act(async () => {
      render(
        <FollowersListModal
          isOpen={true}
          onClose={vi.fn()}
          userId="test-id"
          initialTab="followers"
          initialFollowers={dummyFollowers}
          initialFollowing={dummyFollowing}
        />
      );
    });

    expect(screen.getByText(/Followers \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Following \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('john_doe')).toBeInTheDocument();
  });

  it('switches between tabs on tab click', async () => {
    await act(async () => {
      render(
        <FollowersListModal
          isOpen={true}
          onClose={vi.fn()}
          userId="test-id"
          initialTab="followers"
          initialFollowers={dummyFollowers}
          initialFollowing={dummyFollowing}
        />
      );
    });

    const followingTab = screen.getByText(/Following \(1\)/i);
    await act(async () => {
      fireEvent.click(followingTab);
    });

    expect(screen.getByText('sarah_dev')).toBeInTheDocument();
  });
});
