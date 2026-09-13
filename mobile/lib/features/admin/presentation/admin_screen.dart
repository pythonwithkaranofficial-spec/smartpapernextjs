import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/admin_provider.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AdminProvider>(context, listen: false).fetchAllUsers();
    });
  }

  void _showEditUserDialog(BuildContext context, user) {
    String selectedRole = user.role;
    String selectedPlan = user.plan;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text('Manage ${user.displayName ?? user.email}', style: const TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('User Role:', style: TextStyle(color: Color(0xFF94A3B8))),
            DropdownButton<String>(
              value: selectedRole,
              dropdownColor: const Color(0xFF0F172A),
              style: const TextStyle(color: Colors.white),
              isExpanded: true,
              items: ['USER', 'ADMIN'].map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
              onChanged: (val) {
                if (val != null) selectedRole = val;
              },
            ),
            const SizedBox(height: 16),
            const Text('Subscription Plan:', style: TextStyle(color: Color(0xFF94A3B8))),
            DropdownButton<String>(
              value: selectedPlan,
              dropdownColor: const Color(0xFF0F172A),
              style: const TextStyle(color: Colors.white),
              isExpanded: true,
              items: ['FREE', 'PRO', 'PREMIUM', 'ENTERPRISE'].map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
              onChanged: (val) {
                if (val != null) selectedPlan = val;
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
            onPressed: () async {
              final adminProvider = Provider.of<AdminProvider>(context, listen: false);
              final messenger = ScaffoldMessenger.of(context);
              final nav = Navigator.of(ctx);
              final success = await adminProvider.updateUserRoleOrPlan(
                user.uid,
                role: selectedRole,
                plan: selectedPlan,
              );
              if (success && mounted) {
                nav.pop();
                messenger.showSnackBar(
                  const SnackBar(content: Text('User role & plan updated!')),
                );
              }
            },
            child: const Text('Save Changes'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final adminProvider = Provider.of<AdminProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Admin Console — User Management', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () => adminProvider.fetchAllUsers(),
          ),
        ],
      ),
      body: SafeArea(
        child: adminProvider.isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)))
            : adminProvider.errorMessage != null
                ? Center(child: Text(adminProvider.errorMessage!, style: const TextStyle(color: Colors.redAccent)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: adminProvider.users.length,
                    itemBuilder: (ctx, idx) {
                      final u = adminProvider.users[idx];
                      return Card(
                        color: const Color(0xFF1E293B),
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: Color(0xFF334155)),
                        ),
                        child: ListTile(
                          title: Text(u.displayName ?? u.email, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          subtitle: Text('Email: ${u.email}\nPlan: ${u.plan} | Role: ${u.role}', style: const TextStyle(color: Color(0xFF94A3B8))),
                          trailing: IconButton(
                            icon: const Icon(Icons.edit, color: Color(0xFF818CF8)),
                            onPressed: () => _showEditUserDialog(context, u),
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
