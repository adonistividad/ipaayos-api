import app from './expressApp';
import userRoutes from '../routes/user';
import providersRoutes from '../routes/providers';
import commonTablesRoutes from '../routes/common_tables';
import tasksRoutes from '../routes/tasks';
import messagesRoutes from '../routes/messages';
import reviewsRoutes from '../routes/reviews';
import notificationsRoutes from '../routes/notifications';

app.use('/api/v1', userRoutes);
app.use('/api/v1', providersRoutes);
app.use('/api/v1', commonTablesRoutes);
app.use('/api/v1', tasksRoutes);
app.use('/api/v1', messagesRoutes);
app.use('/api/v1', reviewsRoutes);
app.use('/api/v1', notificationsRoutes);

export default app;
