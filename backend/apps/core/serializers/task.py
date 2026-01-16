from rest_framework import serializers

from apps.core.models import Task, TaskHistory, TaskComment

class TasksListSerializer(serializers.ModelSerializer):

    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'title','description', 'status','priority', 'created_at', 'updated_at', 'assigned_to_name' , 'assigned_to']

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.username if obj.assigned_to else None

class TaskSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    class Meta:
        model = Task
        fields = ['id', 'title', 'description','created_at', 'created_by', 'assigned_to', 'status', 'priority', 'assigned_to_name']

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.username if obj.assigned_to else None

    def validate(self, data):
        if data['title'] == '':
            raise serializers.ValidationError("Title is required.")
        print("USER:", self.context['request'].user)
        data['created_by'] = self.context['request'].user
        return data

    def create(self, validated_data):
        return Task.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.priority = validated_data.get('priority', instance.priority)
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['created_by'] = instance.created_by.username
        representation['assigned_to'] = instance.assigned_to.username if instance.assigned_to else None
        representation['assigned_by'] = instance.assigned_by.username if instance.assigned_by else None
        representation['closed_by'] = instance.closed_by.username if instance.closed_by else None
        representation['deleted_by'] = instance.deleted_by.username if instance.deleted_by else None
        return representation


class TaskHistorySerializer(serializers.ModelSerializer):
    changed_by = serializers.StringRelatedField(read_only=True)
    assigned_to = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = TaskHistory
        fields = '__all__'


class TaskCommentSerializer(serializers.ModelSerializer):
    commented_by = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = TaskComment
        fields = '__all__'
