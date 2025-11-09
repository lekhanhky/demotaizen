import { StyleSheet } from 'react-native';

export const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.headerBackground,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerIcon: {
    fontSize: 24,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.headerBackground,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: theme.primary,
  },
  tabText: {
    color: theme.secondaryText,
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.activeText,
    fontWeight: '700',
  },
  feed: {
    flex: 1,
  },
  post: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.postBackground,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  postContent: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  username: {
    color: theme.secondaryText,
    fontSize: 15,
  },
  time: {
    color: theme.secondaryText,
    fontSize: 15,
  },
  content: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
    gap: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 50,
  },
  iconContainer: {
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionText: {
    color: theme.secondaryText,
    fontSize: 13,
    fontWeight: '500',
  },
  unlikedIcon: {
    color: theme.iconColor,
    fontSize: 20,
  },
  likedIcon: {
    transform: [{ scale: 1.1 }],
  },
  likedText: {
    color: theme.likeColor,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingVertical: 8,
    backgroundColor: theme.headerBackground,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 2,
    opacity: 0.6,
  },
  navIconActive: {
    fontSize: 24,
    marginBottom: 2,
  },
  navText: {
    color: theme.secondaryText,
    fontSize: 11,
  },
  navTextActive: {
    color: theme.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: theme.secondaryText,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repostMenu: {
    backgroundColor: theme.headerBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: 200,
    overflow: 'hidden',
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  repostMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  repostMenuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  repostMenuText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  repostMenuDivider: {
    height: 1,
    backgroundColor: theme.border,
  },
});
